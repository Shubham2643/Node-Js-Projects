import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bloodGroup: {
    type: String,
    required: [true, "Blood group is required"],
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [18, "Must be at least 18 years old"],
    max: [65, "Age limit is 65 years"],
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Gender is required"],
  },
  weight: {
    type: Number,
    min: [45, "Minimum weight should be 45kg"],
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
  lastDonationDate: Date,
  donationHistory: [
    {
      donationDate: { type: Date, default: Date.now },
      facility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
      bloodGroup: String,
      quantity: { type: Number, default: 1 },
      verified: { type: Boolean, default: false },
    },
  ],
  isEligible: { type: Boolean, default: true },
});

// Virtual for eligibility based on 90-day rule
donorSchema.virtual("eligibilityStatus").get(function () {
  if (!this.lastDonationDate) return true;
  const daysSinceLastDonation = Math.floor(
    (Date.now() - this.lastDonationDate) / (1000 * 60 * 60 * 24),
  );
  return daysSinceLastDonation >= 90;
});

export default mongoose.model("Donor", donorSchema);
