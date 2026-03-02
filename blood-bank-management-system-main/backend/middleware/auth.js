// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Donor from "../models/donorModel.js";
import faculty from "../models/facultyModel.js";
import Admin from "../models/adminModel.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    req.user = user;

    // Get role-specific data
    if (user.role === "donor") {
      req.donor = await Donor.findOne({ user: user._id });
    } else if (user.role === "hospital" || user.role === "blood-lab") {
      req.faculty = await faculty.findOne({ user: user._id });
    } else if (user.role === "admin") {
      req.admin = await Admin.findOne({ user: user._id });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// faculty type check
export const facultyType = (...types) => {
  return (req, res, next) => {
    if (!req.faculty || !types.includes(req.faculty.facultyType)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized: Incorrect faculty type",
      });
    }
    next();
  };
};

// Check if faculty is approved
export const facultyApproved = async (req, res, next) => {
  if (req.faculty && req.faculty.status !== "approved") {
    return res.status(403).json({
      success: false,
      message: "faculty not approved yet",
    });
  }
  next();
};
