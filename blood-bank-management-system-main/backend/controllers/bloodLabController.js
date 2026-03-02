import Blood from "../models/bloodModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import Faculty from "../models/facultyModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import Donor from "../models/donorModel.js";
import { AppError } from "../utils/errorHandler.js";
import {
  getIO,
  emitToUser,
  emitToRole,
  SocketEvents,
} from "../socket/index.js";
import { sendEmail } from "../utils/emailService.js";

export const getDashboard = async (req, res, next) => {
  try {
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
    
    const labId = req.user._id;
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      camps,
      stock,
      faculty,
      recentDonations,
      pendingRequests,
      weeklyStats,
    ] = await Promise.all([
      BloodCamp.find({ hospital: labId }).sort({ date: -1 }).limit(10),
      Blood.find({ bloodLab: labId }).sort({ bloodGroup: 1 }),
      Faculty.findById(labId).select(
        "name email phone address operatingHours status history lastLogin",
      ),
      Donor.aggregate([
        { $unwind: "$donationHistory" },
        {
          $match: {
            "donationHistory.faculty": labId,
            "donationHistory.donationDate": { $gt: weekAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$donationHistory.donationDate",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      BloodRequest.countDocuments({ labId, status: "pending" }),
      Blood.aggregate([
        { $match: { bloodLab: labId } },
        {
          $group: {
            _id: "$bloodGroup",
            quantity: { $sum: "$quantity" },
            critical: { $sum: { $cond: [{ $lt: ["$quantity", 5] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const totalUnits = stock.reduce((sum, item) => sum + item.quantity, 0);
    const criticalStock = stock.filter((item) => item.quantity < 5).length;

    res.json({
      success: true,
      data: {
        lab: faculty,
        stats: {
          totalCamps: camps.length,
          upcomingCamps: camps.filter((c) => c.status === "Upcoming").length,
          totalUnits,
          criticalStock,
          pendingRequests,
          recentDonations: recentDonations.length,
        },
        stock: weeklyStats,
        recentCamps: camps,
        weeklyActivity: recentDonations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBloodCamp = async (req, res, next) => {
  const session = await BloodCamp.startSession();
  session.startTransaction();

  try {
    const labId = req.user._id;
    const campData = req.body;

    // Validate dates
    const campDate = new Date(campData.date);
    if (campDate < new Date()) {
      return next(new AppError("Camp date cannot be in the past", 400));
    }

    // Check for overlapping camps
    const existingCamp = await BloodCamp.findOne({
      hospital: labId,
      date: {
        $gte: new Date(campDate).setHours(0, 0, 0),
        $lt: new Date(campDate).setHours(23, 59, 59),
      },
    }).session(session);

    if (existingCamp) {
      return next(new AppError("A camp already exists on this date", 400));
    }

    const camp = await BloodCamp.create(
      [
        {
          hospital: labId,
          ...campData,
          location: {
            venue: campData.venue,
            city: campData.city,
            state: campData.state,
            pincode: campData.pincode,
          },
        },
      ],
      { session },
    );

    // Update faculty history
    await Faculty.findByIdAndUpdate(labId, {
      $push: {
        history: {
          eventType: "Blood Camp",
          description: `Created camp: ${campData.title} at ${campData.venue}`,
          date: new Date(),
          referenceId: camp[0]._id,
        },
      },
    }).session(session);

    await session.commitTransaction();

    // Notify nearby donors
    getIO().to("role:donor").emit("new-camp", {
      campId: camp[0]._id,
      title: campData.title,
      location: campData.city,
      date: campData.date,
      organizedBy: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: "Blood camp created successfully",
      data: camp[0],
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const updateCampStatus = async (req, res, next) => {
  const session = await BloodCamp.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status, actualDonors } = req.body;
    const labId = req.user._id;

    const camp = await BloodCamp.findOne({
      _id: id,
      hospital: labId,
    }).session(session);

    if (!camp) {
      return next(new AppError("Camp not found", 404));
    }

    const oldStatus = camp.status;
    camp.status = status;

    if (actualDonors !== undefined) {
      camp.actualDonors = actualDonors;
    }

    await camp.save({ session });

    // Update faculty history
    await Faculty.findByIdAndUpdate(labId, {
      $push: {
        history: {
          eventType: "Blood Camp",
          description: `Camp status updated from ${oldStatus} to ${status}`,
          date: new Date(),
          referenceId: camp._id,
        },
      },
    }).session(session);

    await session.commitTransaction();

    // Notify about status change
    if (status === "Completed") {
      getIO().to("role:donor").emit("camp-completed", {
        campId: camp._id,
        title: camp.title,
        actualDonors: camp.actualDonors,
      });
    }

    res.json({
      success: true,
      message: "Camp status updated successfully",
      data: camp,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const addBloodStock = async (req, res, next) => {
  const session = await Blood.startSession();
  session.startTransaction();

  try {
    const { bloodType, quantity, expiryDate } = req.body;
    const bloodLab = req.user._id;

    if (!bloodType || !quantity || quantity <= 0) {
      return next(
        new AppError("Please provide valid bloodType and quantity", 400),
      );
    }

    // Set expiry date (42 days from now if not provided)
    const expDate =
      expiryDate || new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);

    let stock = await Blood.findOne({
      bloodGroup: bloodType,
      bloodLab,
    }).session(session);

    if (stock) {
      stock.quantity += Number(quantity);
      stock.expiryDate = expDate;
      await stock.save({ session });
    } else {
      stock = await Blood.create(
        [
          {
            bloodGroup: bloodType,
            quantity: Number(quantity),
            expiryDate: expDate,
            bloodLab,
          },
        ],
        { session },
      );
      stock = stock[0];
    }

    // Update faculty history
    await Faculty.findByIdAndUpdate(bloodLab, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `Added ${quantity} units of ${bloodType}`,
          date: new Date(),
        },
      },
    }).session(session);

    await session.commitTransaction();

    // Check for critical levels after addition
    if (stock.quantity < 10) {
      getIO()
        .to(`user:${bloodLab}`)
        .emit("stock-warning", {
          bloodType,
          quantity: stock.quantity,
          message: `Stock for ${bloodType} is low`,
        });
    }

    res.json({
      success: true,
      message: "Blood stock added successfully",
      data: stock,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getBloodRequests = async (req, res, next) => {
  try {
    const labId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { labId };
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .populate("hospitalId", "name email phone address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BloodRequest.countDocuments(filter),
    ]);

    // Get request statistics
    const stats = await BloodRequest.aggregate([
      { $match: { labId } },
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

export const processBloodRequest = async (req, res, next) => {
  const session = await BloodRequest.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const labId = req.user._id;

    const request = await BloodRequest.findOne({
      _id: id,
      labId,
    })
      .populate("hospitalId")
      .session(session);

    if (!request) {
      return next(new AppError("Request not found", 404));
    }

    if (request.status !== "pending") {
      return next(new AppError("Request already processed", 400));
    }

    if (action === "accept") {
      // Check stock
      const labStock = await Blood.findOne({
        bloodLab: labId,
        bloodGroup: request.bloodType,
      }).session(session);

      if (!labStock || labStock.quantity < request.units) {
        return next(
          new AppError(
            `Insufficient stock. Available: ${labStock?.quantity || 0} units`,
            400,
          ),
        );
      }

      // Update lab stock
      labStock.quantity -= request.units;
      if (labStock.quantity === 0) {
        await Blood.findByIdAndDelete(labStock._id).session(session);
      } else {
        await labStock.save({ session });
      }

      // Add to hospital stock
      const expiryDate = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);
      let hospitalStock = await Blood.findOne({
        hospital: request.hospitalId._id,
        bloodGroup: request.bloodType,
      }).session(session);

      if (hospitalStock) {
        hospitalStock.quantity += request.units;
        hospitalStock.expiryDate = expiryDate;
        await hospitalStock.save({ session });
      } else {
        await Blood.create(
          [
            {
              bloodGroup: request.bloodType,
              quantity: request.units,
              expiryDate,
              hospital: request.hospitalId._id,
            },
          ],
          { session },
        );
      }

      request.status = "accepted";
    } else {
      request.status = "rejected";
    }

    request.processedAt = new Date();
    request.processedBy = labId;
    await request.save({ session });

    // Update history for both parties
    await Faculty.findByIdAndUpdate(labId, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `${action === "accept" ? "Fulfilled" : "Rejected"} blood request for ${request.units} units of ${request.bloodType}`,
          date: new Date(),
          referenceId: request._id,
        },
      },
    }).session(session);

    await Faculty.findByIdAndUpdate(request.hospitalId._id, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `Your request for ${request.units} units of ${request.bloodType} was ${request.status}`,
          date: new Date(),
          referenceId: request._id,
        },
      },
    }).session(session);

    await session.commitTransaction();

    // Send real-time notification
    getIO()
      .to(`user:${request.hospitalId._id}`)
      .emit("request-processed", {
        requestId: request._id,
        status: request.status,
        bloodType: request.bloodType,
        units: request.units,
        message: `Your blood request has been ${request.status}`,
      });

    // Send email notification
    await sendEmail({
      email: request.hospitalId.email,
      subject: `Blood Request ${action === "accept" ? "Accepted" : "Rejected"} - BloodConnect`,
      template: "requestProcessed",
      data: {
        hospitalName: request.hospitalId.name,
        bloodType: request.bloodType,
        units: request.units,
        status: request.status,
        labName: req.user.name,
      },
    });

    res.json({
      success: true,
      message: `Request ${action}ed successfully`,
      data: request,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
