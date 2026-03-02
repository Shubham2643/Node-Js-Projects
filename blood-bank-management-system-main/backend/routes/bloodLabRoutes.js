import express from "express";
import {
  createBloodCamp,
  deleteBloodCamp,
  getBloodLabCamps,
  getBloodLabDashboard,
  getBloodLabHistory,
  updateBloodCamp,        // ADD THIS
  updateCampStatus,       // ADD THIS
  addBloodStock,
  removeBloodStock,
  getBloodStock,
  updateBloodRequestStatus,
  getLabBloodRequests,
  getAllLabs,
} from "../controllers/bloodLabController.js";
import { protectfaculty } from "../middlewares/facultyMiddleware.js";
import { getRecentDonations, markDonation, searchDonor } from "../controllers/donorController.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard", protectfaculty, getBloodLabDashboard);
router.get("/history", protectfaculty, getBloodLabHistory);

// Camp management
router.post("/camps", protectfaculty, createBloodCamp);
router.get("/camps", protectfaculty, getBloodLabCamps);
router.put("/camps/:id", protectfaculty, updateBloodCamp);        // ADD THIS
router.patch("/camps/:id/status", protectfaculty, updateCampStatus); // ADD THIS
router.delete("/camps/:id", protectfaculty, deleteBloodCamp);

// Blood stock routes
router.post("/blood/add", protectfaculty, addBloodStock);
router.post("/blood/remove", protectfaculty, removeBloodStock);
router.get("/blood/stock", protectfaculty, getBloodStock);


// Blood request routes for labs
router.get("/blood/requests", protectfaculty, getLabBloodRequests);
router.put("/blood/requests/:id", protectfaculty, updateBloodRequestStatus);

// Get labs for hospitals
router.get("/labs", protectfaculty, getAllLabs);

// Add these routes to your bloodLabRoutes.js
router.get("/donors/search", protectfaculty, searchDonor);
router.post("/donors/donate/:id", protectfaculty, markDonation);
router.get("/donations/recent", protectfaculty, getRecentDonations);

export default router;