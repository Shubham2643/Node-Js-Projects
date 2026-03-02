// controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Donor from "../models/donorModel.js";
import faculty from "../models/facultyModel.js";
import Admin from "../models/adminModel.js";
import { sendEmail } from "../utils/emailService.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { role, email, password, name, phone, ...roleSpecificData } =
      req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      // If user exists, ensure role-specific profile exists instead of blocking with an error.
      if (role === "donor") {
        let donorProfile = await Donor.findOne({ user: user._id });
        if (!donorProfile) {
          const donorData = {
            user: user._id,
            bloodGroup: roleSpecificData.bloodGroup,
            age: roleSpecificData.age,
            gender: roleSpecificData.gender,
            weight: roleSpecificData.weight,
            address: {
              street: roleSpecificData.street,
              city: roleSpecificData.city,
              state: roleSpecificData.state,
              pincode: roleSpecificData.pincode,
            },
          };
          donorProfile = await Donor.create(donorData);
        }
      } else if (role === "hospital" || role === "blood-lab") {
        let facultyProfile = await faculty.findOne({ user: user._id });
        if (!facultyProfile) {
          facultyProfile = await faculty.create({
            user: user._id,
            facultyType: role,
            ...roleSpecificData,
          });
        }
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Account already existed. Profile verified, you can log in now.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // Create base user
      user = await User.create({
        name,
        email,
        password,
        phone,
        role,
      });

      const userId = user._id;

      // Create role-specific profile
      if (role === "donor") {
        const donorData = {
          user: userId,
          bloodGroup: roleSpecificData.bloodGroup,
          age: roleSpecificData.age,
          gender: roleSpecificData.gender,
          weight: roleSpecificData.weight,
          address: {
            street: roleSpecificData.street,
            city: roleSpecificData.city,
            state: roleSpecificData.state,
            pincode: roleSpecificData.pincode,
          },
        };
        await Donor.create(donorData);
      } else if (role === "hospital" || role === "blood-lab") {
        await faculty.create({
          user: userId,
          facultyType: role,
          ...roleSpecificData,
        });
      }

      // Generate token
      const token = generateToken(userId);

      // Send welcome email
      await sendEmail({
        email: user.email,
        subject: "Welcome to BloodConnect",
        template: "welcome",
        data: { name: user.name, role },
      });

      res.status(201).json({
        success: true,
        message:
          role === "donor"
            ? "Registration successful! You can now log in."
            : "Registration successful! Please wait for admin approval.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact support.",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get role-specific data and check status
    let roleData = null;
    let redirect = "/dashboard";

    if (user.role === "donor") {
      roleData = await Donor.findOne({ user: user._id });
      redirect = "/donor/dashboard";
    } else if (user.role === "hospital" || user.role === "blood-lab") {
      roleData = await faculty.findOne({ user: user._id });

      // Check faculty status
      if (roleData && roleData.status !== "approved") {
        return res.status(403).json({
          success: false,
          message: `Your account is ${roleData.status}. Please wait for approval.`,
        });
      }

      redirect =
        user.role === "hospital" ? "/hospital/dashboard" : "/lab/dashboard";
    } else if (user.role === "admin") {
      roleData = await Admin.findOne({ user: user._id });
      redirect = "/admin/dashboard";
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      roleData,
      redirect,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    let profileData = {
      user: req.user,
    };

    // Get role-specific data
    if (req.user.role === "donor") {
      profileData.donor = await Donor.findOne({ user: req.user._id }).populate(
        "donationHistory.faculty",
        "name address",
      );
    } else if (req.user.role === "hospital" || req.user.role === "blood-lab") {
      profileData.faculty = await faculty.findOne({ user: req.user._id });
    } else if (req.user.role === "admin") {
      profileData.admin = await Admin.findOne({ user: req.user._id });
    }

    res.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Update last logout if needed
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
