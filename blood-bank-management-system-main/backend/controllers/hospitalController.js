import Blood from "../models/bloodModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import Faculty from "../models/facultyModel.js";
import Donor from "../models/donorModel.js";
import { AppError } from "../utils/errorHandler.js";
import {
  getIO,
  emitToUser,
  emitToRole,
  SocketEvents,
} from "../socket/index.js";

export const getDashboard = async (req, res, next) => {
  try {
    const hospitalId = req.user._id;

    // Emit to specific user
    emitToUser(userId, SocketEvents.NOTIFICATION, {
      message: "Your request has been processed",
    });

    // Emit to all donors
    emitToRole("donor", SocketEvents.NEW_CAMP, {
      campId: newCamp._id,
      title: "Blood Donation Camp",
    });

    // Get IO instance for more complex operations
    const io = getIO();
    io.to(`camp:${campId}`).emit(SocketEvents.CAMP_UPDATED, {
      status: "completed",
    });

    res.json({ success: true });

    const [
      inventory,
      requests,
      hospital,
      lowStock,
      expiringSoon,
      recentDonors,
    ] = await Promise.all([
      Blood.find({ hospital: hospitalId }).sort({ bloodGroup: 1 }),
      BloodRequest.find({ hospitalId })
        .populate("labId", "name email phone")
        .sort({ createdAt: -1 })
        .limit(10),
      Faculty.findById(hospitalId).select(
        "name email phone address operatingHours history lastLogin",
      ),
      Blood.countDocuments({
        hospital: hospitalId,
        quantity: { $lt: 5 },
      }),
      Blood.countDocuments({
        hospital: hospitalId,
        expiryDate: {
          $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          $gt: new Date(),
        },
      }),
      Donor.find({
        "donationHistory.faculty": hospitalId,
      })
        .select("fullName bloodGroup lastDonationDate")
        .sort({ "donationHistory.donationDate": -1 })
        .limit(5),
    ]);

    const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const pendingRequests = requests.filter(
      (r) => r.status === "pending",
    ).length;

    // Calculate inventory by blood type
    const inventoryByType = inventory.reduce((acc, item) => {
      acc[item.bloodGroup] = {
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        status:
          item.quantity < 5
            ? "critical"
            : item.quantity < 10
              ? "low"
              : "normal",
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        hospital: {
          name: hospital.name,
          email: hospital.email,
          phone: hospital.phone,
          address: hospital.address,
          operatingHours: hospital.operatingHours,
        },
        stats: {
          totalUnits,
          pendingRequests,
          lowStock,
          expiringSoon,
          totalRequests: requests.length,
        },
        inventory: inventoryByType,
        recentRequests: requests,
        recentDonors,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestBlood = async (req, res, next) => {
  const session = await BloodRequest.startSession();
  session.startTransaction();

  try {
    const hospitalId = req.user._id;
    const { labId, bloodType, units, urgency = "normal", notes } = req.body;

    // Validate
    if (!labId || !bloodType || !units) {
      return next(
        new AppError("Please provide labId, bloodType, and units", 400),
      );
    }

    if (units < 1 || units > 100) {
      return next(new AppError("Units must be between 1 and 100", 400));
    }

    // Check lab exists and is approved
    const lab = await Faculty.findOne({
      _id: labId,
      facultyType: "blood-lab",
      status: "approved",
    }).session(session);

    if (!lab) {
      return next(new AppError("Blood lab not found or not approved", 404));
    }

    // Check for duplicate pending request
    const existingRequest = await BloodRequest.findOne({
      hospitalId,
      labId,
      bloodType,
      status: "pending",
    }).session(session);

    if (existingRequest) {
      return next(
        new AppError(
          "You already have a pending request for this blood type from this lab",
          400,
        ),
      );
    }

    // Create request
    const request = await BloodRequest.create(
      [
        {
          hospitalId,
          labId,
          bloodType,
          units,
          urgency,
          notes,
          requestedAt: new Date(),
        },
      ],
      { session },
    );

    // Add to hospital history
    await Faculty.findByIdAndUpdate(hospitalId, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `Requested ${units} units of ${bloodType} from ${lab.name} (${urgency})`,
          date: new Date(),
          referenceId: request[0]._id,
        },
      },
    }).session(session);

    await session.commitTransaction();

    // Notify lab
    getIO().to(`user:${labId}`).emit("new-request", {
      requestId: request[0]._id,
      hospitalName: req.user.name,
      bloodType,
      units,
      urgency,
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Blood request sent successfully",
      data: request[0],
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const hospitalId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { hospitalId };
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .populate("labId", "name email phone address operatingHours")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BloodRequest.countDocuments(filter),
    ]);

    // Get statistics
    const stats = await BloodRequest.aggregate([
      { $match: { hospitalId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalUnits: { $sum: "$units" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        requests,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    const hospitalId = req.user._id;

    const inventory = await Blood.find({ hospital: hospitalId }).sort({
      bloodGroup: 1,
    });

    // Get expiry summary
    const expirySummary = inventory.map((item) => ({
      bloodGroup: item.bloodGroup,
      quantity: item.quantity,
      expiryDate: item.expiryDate,
      daysUntilExpiry: Math.ceil(
        (item.expiryDate - new Date()) / (1000 * 60 * 60 * 24),
      ),
      status:
        item.expiryDate < new Date()
          ? "expired"
          : item.expiryDate < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            ? "critical"
            : item.expiryDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              ? "warning"
              : "good",
    }));

    // Calculate totals
    const totals = {
      totalUnits: inventory.reduce((sum, item) => sum + item.quantity, 0),
      expiringSoon: expirySummary.filter(
        (i) => i.status === "critical" || i.status === "warning",
      ).length,
      expired: expirySummary.filter((i) => i.status === "expired").length,
      byBloodType: expirySummary.reduce((acc, item) => {
        acc[item.bloodGroup] = {
          quantity: item.quantity,
          status: item.status,
          daysUntilExpiry: item.daysUntilExpiry,
        };
        return acc;
      }, {}),
    };

    res.json({
      success: true,
      data: {
        inventory: expirySummary,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDonors = async (req, res, next) => {
  try {
    const { search, bloodGroup, city, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (bloodGroup && bloodGroup !== "all") {
      filter.bloodGroup = bloodGroup;
    }

    if (city && city !== "all") {
      filter["address.city"] = { $regex: city, $options: "i" };
    }

    // Only show eligible donors
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    filter.$or = [
      { lastDonationDate: { $lt: threeMonthsAgo } },
      { lastDonationDate: { $exists: false } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donors, total] = await Promise.all([
      Donor.find(filter)
        .select(
          "fullName email phone bloodGroup lastDonationDate address.city donationHistory",
        )
        .sort({ lastDonationDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Donor.countDocuments(filter),
    ]);

    // Enhance with donation count
    const enhancedDonors = donors.map((donor) => ({
      ...donor.toObject(),
      totalDonations: donor.donationHistory?.length || 0,
    }));

    res.json({
      success: true,
      data: {
        donors: enhancedDonors,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
