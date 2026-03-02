import express from "express";
import { protectfaculty } from "../middlewares/facultyMiddleware.js";
import {
  requestBlood,
  getRequests,
  getDashboard,
  getInventory,
  getDonors,
} from "../controllers/hospitalController.js";

const router = express.Router();

// Blood request routes for hospitals
router.post("/blood/request", protectfaculty, requestBlood);
router.get("/blood/requests", protectfaculty, getRequests);

// Dashboard and inventory
router.get("/dashboard", protectfaculty, getDashboard);
router.get("/blood/stock", protectfaculty, getInventory);

// Donors list (for hospital to contact)
router.get("/donors", protectfaculty, getDonors);

export default router;