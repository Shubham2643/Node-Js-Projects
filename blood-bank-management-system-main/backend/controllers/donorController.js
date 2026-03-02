// controllers/donorController.js
import Donor from "../models/donorModel.js";
import User from "../models/UserModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import { AppError } from "../utils/errorHandler.js";
import { getIO } from "../socket/index.js";

// @desc    Get donor profile
// @route   GET /api/donor/profile
// @access  Private/Donor
export const getDonorProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.user.id)
      .populate({
        path: "donationHistory.faculty",
        select: "name address.city address.state",
      })
      .select("-password -refreshToken -emailVerificationToken");

    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    // Calculate eligibility (90-day rule)
    const isEligible = donor.isEligible;

    // Get next eligible date
    let nextEligibleDate = null;
    if (donor.lastDonationDate) {
      const next = new Date(donor.lastDonationDate);
      next.setDate(next.getDate() + 90);
      nextEligibleDate = next;
    }

    // Get donation statistics
    const donationStats = {
      totalDonations: donor.donationHistory.length,
      totalUnits: donor.donationHistory.reduce(
        (sum, d) => sum + (d.quantity || 1),
        0,
      ),
      lastDonation: donor.lastDonationDate,
      nextEligibleDate,
      isEligible,
    };

    res.json({
      success: true,
      data: {
        profile: {
          id: donor._id,
          fullName: donor.fullName,
          email: donor.email,
          phone: donor.phone,
          bloodGroup: donor.bloodGroup,
          age: donor.age,
          gender: donor.gender,
          weight: donor.weight,
          address: donor.address,
          isEmailVerified: donor.isEmailVerified,
        },
        donationStats,
        recentDonations: donor.donationHistory.slice(-5).reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor profile
// @route   PUT /api/donor/profile
// @access  Private/Donor
export const updateDonorProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      "fullName",
      "phone",
      "address",
      "age",
      "gender",
      "weight",
      "bloodGroup",
    ];

    // Filter updates
    const filteredUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Check if updating to ineligible
    if (updates.weight && updates.weight < 45) {
      filteredUpdates.eligibleToDonate = false;
    }

    const donor = await Donor.findByIdAndUpdate(req.user.id, filteredUpdates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: donor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor statistics
// @route   GET /api/donor/stats
// @access  Private/Donor
export const getDonorStats = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.user.id);

    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    // Calculate various stats
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const stats = {
      totalDonations: donor.donationHistory.length,
      totalUnits: donor.donationHistory.reduce(
        (sum, d) => sum + (d.quantity || 1),
        0,
      ),
      lastDonation: donor.lastDonationDate,
      isEligible: donor.isEligible,
      daysSinceLastDonation: donor.lastDonationDate
        ? Math.floor((now - donor.lastDonationDate) / (1000 * 60 * 60 * 24))
        : null,
      donationsThisYear: donor.donationHistory.filter(
        (d) => new Date(d.donationDate).getFullYear() === now.getFullYear(),
      ).length,
      uniqueFacilities: new Set(
        donor.donationHistory.map((d) => d.faculty?.toString()),
      ).size,
    };

    // Get monthly donation trend
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStr = month.toLocaleString("default", { month: "short" });

      const count = donor.donationHistory.filter((d) => {
        const donationDate = new Date(d.donationDate);
        return (
          donationDate.getMonth() === month.getMonth() &&
          donationDate.getFullYear() === month.getFullYear()
        );
      }).length;

      last6Months.push({ month: monthStr, count });
    }

    res.json({
      success: true,
      data: {
        stats,
        monthlyTrend: last6Months,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available blood camps for donors
// @route   GET /api/donor/camps
// @access  Private/Donor
export const getDonorCamps = async (req, res, next) => {
  try {
    const { status, city, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (city && city !== "all") {
      filter["location.city"] = city;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.venue": { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    // Only show upcoming and ongoing camps to donors
    filter.status = { $in: ["Upcoming", "Ongoing"] };
    filter.date = { $gte: new Date() };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [camps, total] = await Promise.all([
      BloodCamp.find(filter)
        .populate("hospital", "name email phone")
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BloodCamp.countDocuments(filter),
    ]);

    // Check if donor is registered for each camp
    const donor = await Donor.findById(req.user.id);
    const campsWithRegistration = camps.map((camp) => {
      const campObj = camp.toObject();
      campObj.isRegistered =
        donor?.donationHistory?.some(
          (h) => h.campId?.toString() === camp._id.toString(),
        ) || false;
      return campObj;
    });

    // Get unique cities for filter
    const cities = await BloodCamp.distinct("location.city", {
      status: { $in: ["Upcoming", "Ongoing"] },
    });

    res.json({
      success: true,
      data: {
        camps: campsWithRegistration,
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

// @desc    Register for a blood camp
// @route   POST /api/donor/camps/:id/register
// @access  Private/Donor
export const registerForCamp = async (req, res, next) => {
  const session = await Donor.startSession();
  session.startTransaction();

  try {
    const campId = req.params.id;
    const donorId = req.user.id;

    // Find camp
    const camp = await BloodCamp.findById(campId).session(session);
    if (!camp) {
      await session.abortTransaction();
      return next(new AppError("Camp not found", 404));
    }

    // Check if camp is upcoming
    if (camp.status !== "Upcoming") {
      await session.abortTransaction();
      return next(new AppError("Camp is not available for registration", 400));
    }

    // Check if donor is eligible
    const donor = await Donor.findById(donorId).session(session);
    if (!donor.isEligible) {
      await session.abortTransaction();
      return next(
        new AppError("You are not eligible to donate blood at this time", 400),
      );
    }

    // Check if already registered
    const alreadyRegistered = camp.registeredDonors?.some(
      (id) => id.toString() === donorId,
    );

    if (alreadyRegistered) {
      await session.abortTransaction();
      return next(new AppError("Already registered for this camp", 400));
    }

    // Register donor
    if (!camp.registeredDonors) {
      camp.registeredDonors = [];
    }
    camp.registeredDonors.push(donorId);
    await camp.save({ session });

    await session.commitTransaction();

    // Notify camp organizers
    getIO().to(`facility:${camp.hospital}`).emit("camp-registration", {
      campId: camp._id,
      donorName: donor.fullName,
      donorBloodGroup: donor.bloodGroup,
    });

    res.json({
      success: true,
      message: "Successfully registered for camp",
      data: camp,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get donor donation history
// @route   GET /api/donor/history
// @access  Private/Donor
export const getDonorHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donor = await Donor.findById(req.user.id).populate({
      path: "donationHistory.faculty",
      select: "name address.city",
    });

    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    // Sort history by date (most recent first)
    const history = [...donor.donationHistory].sort(
      (a, b) => new Date(b.donationDate) - new Date(a.donationDate),
    );

    const total = history.length;
    const paginatedHistory = history.slice(skip, skip + parseInt(limit));

    // Get statistics
    const stats = {
      totalDonations: total,
      totalUnits: history.reduce((sum, d) => sum + (d.quantity || 1), 0),
      firstDonation:
        history.length > 0 ? history[history.length - 1].donationDate : null,
      lastDonation: history.length > 0 ? history[0].donationDate : null,
      uniqueFacilities: new Set(history.map((d) => d.faculty?._id?.toString()))
        .size,
    };

    res.json({
      success: true,
      data: {
        history: paginatedHistory,
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

// @desc    Get donation certificate
// @route   GET /api/donor/certificate/:donationId
// @access  Private/Donor
export const getDonationCertificate = async (req, res, next) => {
  try {
    const { donationId } = req.params;

    const donor = await Donor.findOne({
      _id: req.user.id,
      "donationHistory._id": donationId,
    }).populate("donationHistory.faculty", "name registrationNumber");

    if (!donor) {
      return next(new AppError("Donation record not found", 404));
    }

    const donation = donor.donationHistory.id(donationId);

    // Generate certificate data
    const certificate = {
      id: donation._id,
      donorName: donor.fullName,
      donorBloodGroup: donor.bloodGroup,
      donationDate: donation.donationDate,
      facilityName: donation.faculty?.name || "Blood Connect",
      facilityRegNo: donation.faculty?.registrationNumber || "N/A",
      quantity: donation.quantity || 1,
      certificateNumber: `BC-${donation._id.toString().slice(-8).toUpperCase()}`,
      issuedAt: new Date(),
    };

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search for donors (for hospitals/labs)
// @route   GET /api/donor/search
// @access  Private/Hospital or Lab
export const searchDonor = async (req, res, next) => {
  try {
    const { query, bloodGroup, city } = req.query;

    const filter = {};

    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ];
    }

    if (bloodGroup && bloodGroup !== "all") {
      filter.bloodGroup = bloodGroup;
    }

    if (city && city !== "all") {
      filter["address.city"] = { $regex: city, $options: "i" };
    }

    const donors = await Donor.find(filter)
      .select("fullName email phone bloodGroup lastDonationDate address.city")
      .limit(20);

    res.json({
      success: true,
      data: donors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark donation (for labs/hospitals)
// @route   POST /api/donor/donate/:id
// @access  Private/Hospital or Lab
export const markDonation = async (req, res, next) => {
  const session = await Donor.startSession();
  session.startTransaction();

  try {
    const donorId = req.params.id;
    const { quantity = 1, remarks } = req.body;
    const facultyId = req.user._id;

    const donor = await Donor.findById(donorId).session(session);
    if (!donor) {
      await session.abortTransaction();
      return next(new AppError("Donor not found", 404));
    }

    // Check eligibility
    if (!donor.isEligible) {
      await session.abortTransaction();
      return next(new AppError("Donor is not eligible to donate", 400));
    }

    // Add to donation history
    donor.donationHistory.push({
      donationDate: new Date(),
      faculty: facultyId,
      bloodGroup: donor.bloodGroup,
      quantity,
      remarks,
      verified: true,
    });

    // Update last donation date
    donor.lastDonationDate = new Date();

    await donor.save({ session });
    await session.commitTransaction();

    // Emit real-time update
    getIO().to(`user:${donorId}`).emit("donation-made", {
      message: "Your donation has been recorded",
      donationDate: new Date(),
    });

    res.json({
      success: true,
      message: "Donation recorded successfully",
      data: donor,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get recent donations (for labs/hospitals)
// @route   GET /api/donor/recent-donations
// @access  Private/Hospital or Lab
export const getRecentDonations = async (req, res, next) => {
  try {
    const facultyId = req.user._id;
    const { limit = 10 } = req.query;

    const donors = await Donor.find({
      "donationHistory.faculty": facultyId,
    })
      .select("fullName bloodGroup donationHistory")
      .populate("donationHistory.faculty", "name")
      .sort({ "donationHistory.donationDate": -1 })
      .limit(parseInt(limit));

    // Extract recent donations
    const recentDonations = [];
    donors.forEach((donor) => {
      donor.donationHistory.forEach((donation) => {
        if (donation.faculty?._id.toString() === facultyId.toString()) {
          recentDonations.push({
            donorName: donor.fullName,
            bloodGroup: donor.bloodGroup,
            donationDate: donation.donationDate,
            quantity: donation.quantity,
            facility: donation.faculty?.name,
          });
        }
      });
    });

    // Sort by date and limit
    recentDonations.sort(
      (a, b) => new Date(b.donationDate) - new Date(a.donationDate),
    );
    const limitedDonations = recentDonations.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedDonations,
    });
  } catch (error) {
    next(error);
  }
};
