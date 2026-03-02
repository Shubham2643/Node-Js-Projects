// models/BloodRequest.js
import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    bloodLab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    units: {
      type: Number,
      required: true,
      min: 1,
    },
    urgency: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    notes: String,
    processedAt: Date,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Index for better query performance
bloodRequestSchema.index({ hospital: 1, status: 1 });
bloodRequestSchema.index({ bloodLab: 1, status: 1 });

export default mongoose.model("BloodRequest", bloodRequestSchema);
