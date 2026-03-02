// routes/adminRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getDashboardStats,
  getAllFaculties,
  getAllDonors,
  approveFaculty,
  rejectFaculty,
} from "../controllers/adminController.js";

const router = express.Router();

// Protect all admin routes
router.use(protect);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Faculty management
router.get("/faculties", getAllFaculties);
router.put("/faculty/approve/:id", approveFaculty);
router.put("/faculty/reject/:id", rejectFaculty);

// Donor management
router.get("/donors", getAllDonors);

export default router;
