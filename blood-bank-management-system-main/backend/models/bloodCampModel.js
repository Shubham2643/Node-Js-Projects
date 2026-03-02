// models/BloodCamp.js
import mongoose from "mongoose";

const bloodCampSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Camp title is required"],
      trim: true,
    },
    description: String,
    date: {
      type: Date,
      required: [true, "Camp date is required"],
    },
    time: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    location: {
      venue: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: {
        type: String,
        match: [/^[1-9][0-9]{5}$/, "Invalid pincode"],
      },
    },
    expectedDonors: { type: Number, default: 0 },
    actualDonors: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    registeredDonors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
        registeredAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("BloodCamp", bloodCampSchema);
