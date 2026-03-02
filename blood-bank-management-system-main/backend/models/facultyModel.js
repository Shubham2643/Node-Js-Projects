import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  facultyType: {
    type: String,
    enum: ["hospital", "blood-lab"],
    required: true,
  },
  registrationNumber: {
    type: String,
    required: [true, "Registration number is required"],
    unique: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: {
      type: String,
      required: true,
      match: [/^[1-9][0-9]{5}$/, "Invalid pincode"],
    },
  },
  emergencyContact: String,
  operatingHours: {
    open: { type: String, default: "09:00" },
    close: { type: String, default: "18:00" },
    workingDays: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  },
  is24x7: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: Date,
  rejectionReason: String,
  documents: {
    registrationProof: {
      url: String,
      filename: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  },
  history: [
    {
      eventType: {
        type: String,
        enum: [
          "Login",
          "Verification",
          "Stock Update",
          "Blood Camp",
          "Request",
          "Profile Update",
        ],
      },
      description: String,
      date: { type: Date, default: Date.now },
      referenceId: mongoose.Schema.Types.ObjectId,
    },
  ],
});

export default mongoose.model("faculty", facultySchema);
