// controllers/facultyController.js
import Faculty from "../models/facultyModel.js";
import User from "../models/UserModel.js";
import Blood from "../models/bloodModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import Donor from "../models/donorModel.js";
import { AppError } from "../utils/errorHandler.js";
import { getIO } from "../socket/index.js";

// @desc    Get faculty profile
// @route   GET /api/faculty/profile
// @access  Private/Faculty
export const getProfile = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.user._id || req.user.id)
      .populate("user", "name email phone")
      .select("-password -refreshToken");

    if (!faculty) {
      return next(new AppError("Faculty not found", 404));
    }

    res.json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update faculty profile
// @route   PUT /api/faculty/profile
// @access  Private/Faculty
export const updateProfile = async (req, res, next) => {
  const session = await Faculty.startSession();
  session.startTransaction();

  try {
    const updates = req.body;
    const allowedUpdates = [
      "name",
      "phone",
      "emergencyContact",
      "operatingHours",
      "address",
      "description",
    ];

    // Filter updates
    const filteredUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const faculty = await Faculty.findByIdAndUpdate(
      req.user._id || req.user.id,
      {
        ...filteredUpdates,
        $push: {
          history: {
            eventType: "Profile Update",
            description: "Profile information updated",
            date: new Date(),
          },
        },
      },
      { new: true, runValidators: true, session },
    ).select("-password");

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: faculty,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get faculty dashboard
// @route   GET /api/faculty/dashboard
// @access  Private/Faculty
export const getFacultyDashboard = async (req, res, next) => {
  try {
    const facultyId = req.user._id || req.user.id;
    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return next(new AppError("Faculty not found", 404));
    }

    let dashboardData = {
      profile: {
        name: faculty.name,
        email: faculty.email,
        phone: faculty.phone,
        address: faculty.address,
        type: faculty.facultyType,
        status: faculty.status,
        lastLogin: faculty.lastLogin,
      },
    };

    // Get faculty-specific data based on type
    if (faculty.facultyType === "blood-lab") {
      // Blood lab dashboard
      const [bloodStock, pendingRequests, recentCamps] = await Promise.all([
        Blood.find({ bloodLab: facultyId }).sort({ bloodGroup: 1 }),
        BloodRequest.countDocuments({ labId: facultyId, status: "pending" }),
        BloodCamp.find({ hospital: facultyId }).sort({ date: -1 }).limit(5),
      ]);

      const totalUnits = bloodStock.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );
      const criticalStock = bloodStock.filter(
        (item) => (item.quantity || 0) < 5,
      ).length;

      dashboardData = {
        ...dashboardData,
        stats: {
          totalUnits,
          criticalStock,
          pendingRequests,
          totalCamps: recentCamps.length,
        },
        bloodStock,
        recentCamps,
      };
    } else if (faculty.facultyType === "hospital") {
      // Hospital dashboard
      const [inventory, pendingRequests, recentRequests] = await Promise.all([
        Blood.find({ hospital: facultyId }).sort({ bloodGroup: 1 }),
        BloodRequest.countDocuments({
          hospitalId: facultyId,
          status: "pending",
        }),
        BloodRequest.find({ hospitalId: facultyId })
          .populate("labId", "name")
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

      const totalUnits = inventory.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );
      const lowStock = inventory.filter(
        (item) => (item.quantity || 0) < 5,
      ).length;

      dashboardData = {
        ...dashboardData,
        stats: {
          totalUnits,
          lowStock,
          pendingRequests,
          totalRequests: recentRequests.length,
        },
        inventory,
        recentRequests,
      };
    }

    // Get recent activity from history
    const recentActivity =
      faculty.history
        ?.sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10) || [];

    dashboardData.recentActivity = recentActivity;

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blood labs
// @route   GET /api/faculty/labs
// @access  Private/Faculty
export const getAllLabs = async (req, res, next) => {
  try {
    const { city, page = 1, limit = 20 } = req.query;

    const filter = {
      facultyType: "blood-lab",
      status: "approved",
    };

    if (city) {
      filter["address.city"] = { $regex: city, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [labs, total] = await Promise.all([
      Faculty.find(filter)
        .populate("user", "name email phone")
        .select("name email phone address operatingHours")
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Faculty.countDocuments(filter),
    ]);

    // Get unique cities for filter
    const cities = await Faculty.distinct("address.city", filter);

    res.json({
      success: true,
      data: {
        labs,
        cities,
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

// @desc    Get faculty statistics
// @route   GET /api/faculty/stats
// @access  Private/Faculty
export const getFacultyStats = async (req, res, next) => {
  try {
    const facultyId = req.user._id || req.user.id;
    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return next(new AppError("Faculty not found", 404));
    }

    let stats = {};

    if (faculty.facultyType === "blood-lab") {
      // Lab statistics
      const [
        totalDonations,
        totalRequests,
        fulfilledRequests,
        totalCamps,
        bloodTypeDistribution,
      ] = await Promise.all([
        Donor.aggregate([
          { $unwind: "$donationHistory" },
          { $match: { "donationHistory.faculty": facultyId } },
          { $count: "total" },
        ]).then((r) => r[0]?.total || 0),
        BloodRequest.countDocuments({ labId: facultyId }),
        BloodRequest.countDocuments({ labId: facultyId, status: "accepted" }),
        BloodCamp.countDocuments({ hospital: facultyId }),
        Blood.aggregate([
          { $match: { bloodLab: facultyId } },
          {
            $group: {
              _id: "$bloodGroup",
              quantity: { $sum: "$quantity" },
            },
          },
        ]),
      ]);

      stats = {
        totalDonations,
        totalRequests,
        fulfilledRequests,
        pendingRequests: totalRequests - fulfilledRequests,
        fulfillmentRate:
          totalRequests > 0 ? (fulfilledRequests / totalRequests) * 100 : 0,
        totalCamps,
        bloodTypeDistribution,
      };
    } else if (faculty.facultyType === "hospital") {
      // Hospital statistics
      const [
        totalRequests,
        fulfilledRequests,
        totalReceived,
        bloodTypeDistribution,
      ] = await Promise.all([
        BloodRequest.countDocuments({ hospitalId: facultyId }),
        BloodRequest.countDocuments({
          hospitalId: facultyId,
          status: "accepted",
        }),
        Blood.aggregate([
          { $match: { hospital: facultyId } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]).then((r) => r[0]?.total || 0),
        Blood.aggregate([
          { $match: { hospital: facultyId } },
          {
            $group: {
              _id: "$bloodGroup",
              quantity: { $sum: "$quantity" },
            },
          },
        ]),
      ]);

      stats = {
        totalRequests,
        fulfilledRequests,
        pendingRequests: totalRequests - fulfilledRequests,
        fulfillmentRate:
          totalRequests > 0 ? (fulfilledRequests / totalRequests) * 100 : 0,
        totalReceived,
        bloodTypeDistribution,
      };
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty history
// @route   GET /api/faculty/history
// @access  Private/Faculty
export const getFacultyHistory = async (req, res, next) => {
  try {
    const facultyId = req.user._id || req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return next(new AppError("Faculty not found", 404));
    }

    const history = faculty.history || [];
    const sortedHistory = history.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedHistory = sortedHistory.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        total: history.length,
        page: parseInt(page),
        pages: Math.ceil(history.length / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
