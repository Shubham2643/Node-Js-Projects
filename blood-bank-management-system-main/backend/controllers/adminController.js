// controllers/adminController.js
import Donor from "../models/donorModel.js";
import Faculty from "../models/facultyModel.js";
import Blood from "../models/bloodModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import Admin from "../models/adminModel.js";
import { AppError } from "../utils/errorHandler.js";
import { getIO } from "../socket/index.js";
import { sendEmail } from "../utils/emailService.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDonors,
      totalFaculties,
      pendingFaculties,
      approvedFaculties,
      totalDonations,
      activeDonors,
      totalBloodUnits,
      totalRequests,
      pendingRequests,
      upcomingCamps,
    ] = await Promise.all([
      Donor.countDocuments(),
      Faculty.countDocuments(),
      Faculty.countDocuments({ status: "pending" }),
      Faculty.countDocuments({ status: "approved" }),
      Donor.aggregate([
        { $unwind: "$donationHistory" },
        { $count: "total" },
      ]).then((result) => result[0]?.total || 0),
      Donor.countDocuments({
        $or: [
          {
            lastDonationDate: {
              $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
          },
          { lastDonationDate: { $exists: false } },
        ],
      }),
      Blood.aggregate([
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]).then((result) => result[0]?.total || 0),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: "pending" }),
      BloodCamp.countDocuments({
        status: "Upcoming",
        date: { $gt: new Date() },
      }),
    ]);

    // Get blood type distribution
    const bloodTypeDistribution = await Blood.aggregate([
      {
        $group: {
          _id: "$bloodGroup",
          quantity: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get recent activity
    const recentActivity = await Promise.all([
      Donor.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName email createdAt"),
      Faculty.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email facultyType status createdAt"),
      BloodRequest.find()
        .populate("hospitalId", "name")
        .populate("labId", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalDonors,
          totalFaculties,
          approvedFaculties,
          pendingFaculties,
          totalDonations,
          activeDonors,
          totalBloodUnits,
          totalRequests,
          pendingRequests,
          upcomingCamps,
        },
        bloodTypeDistribution,
        recentActivity: {
          donors: recentActivity[0],
          faculties: recentActivity[1],
          requests: recentActivity[2],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all faculties
// @route   GET /api/admin/faculties
// @access  Private/Admin
export const getAllFaculties = async (req, res, next) => {
  try {
    const { status, type, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (type && type !== "all") filter.facultyType = type;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [faculties, total] = await Promise.all([
      Faculty.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password -refreshToken"),
      Faculty.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        faculties,
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

// @desc    Get all donors
// @route   GET /api/admin/donors
// @access  Private/Admin
export const getAllDonors = async (req, res, next) => {
  try {
    const { bloodGroup, city, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (bloodGroup && bloodGroup !== "all") filter.bloodGroup = bloodGroup;
    if (city && city !== "all") filter["address.city"] = city;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donors, total] = await Promise.all([
      Donor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password -refreshToken"),
      Donor.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        donors,
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

// @desc    Approve faculty
// @route   PUT /api/admin/faculty/approve/:id
// @access  Private/Admin
export const approveFaculty = async (req, res, next) => {
  const session = await Faculty.startSession();
  session.startTransaction();

  try {
    const faculty = await Faculty.findById(req.params.id).session(session);

    if (!faculty) {
      await session.abortTransaction();
      return next(new AppError("Faculty not found", 404));
    }

    if (faculty.status === "approved") {
      await session.abortTransaction();
      return next(new AppError("Faculty already approved", 400));
    }

    faculty.status = "approved";
    faculty.approvedBy = req.user.id;
    faculty.approvedAt = new Date();

    faculty.history = faculty.history || [];
    faculty.history.push({
      eventType: "Verification",
      description: "Account approved by admin",
      date: new Date(),
    });

    await faculty.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      message: "Faculty approved successfully",
      data: faculty,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Reject faculty
// @route   PUT /api/admin/faculty/reject/:id
// @access  Private/Admin
export const rejectFaculty = async (req, res, next) => {
  const session = await Faculty.startSession();
  session.startTransaction();

  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return next(new AppError("Rejection reason is required", 400));
    }

    const faculty = await Faculty.findById(req.params.id).session(session);

    if (!faculty) {
      await session.abortTransaction();
      return next(new AppError("Faculty not found", 404));
    }

    faculty.status = "rejected";
    faculty.rejectionReason = rejectionReason;
    faculty.rejectedBy = req.user.id;
    faculty.rejectedAt = new Date();

    faculty.history = faculty.history || [];
    faculty.history.push({
      eventType: "Verification",
      description: `Account rejected: ${rejectionReason}`,
      date: new Date(),
    });

    await faculty.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      message: "Faculty rejected",
      data: faculty,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
