// routes/facultyRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  getFacultyDashboard,
  getAllLabs,
  getFacultyStats,
  getFacultyHistory,
} from "../controllers/facultyController.js";

const router = express.Router();

// Protect all faculty routes
router.use(protect);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Dashboard route
router.get("/dashboard", getFacultyDashboard);

// Statistics route
router.get("/stats", getFacultyStats);

// History route
router.get("/history", getFacultyHistory);

// Labs route (for hospitals to view blood labs)
router.get("/labs", getAllLabs);

export default router;
