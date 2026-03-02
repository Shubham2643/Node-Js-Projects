import mongoose from "mongoose";

const bloodSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "expired", "used"],
      default: "available",
    },
  },
  { timestamps: true },
);

// Set expiry date to 42 days from now if not provided
bloodSchema.pre("save", function (next) {
  if (!this.expiryDate) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 42);
    this.expiryDate = expiry;
  }
  next();
});

// Index for better query performance
bloodSchema.index({ facility: 1, bloodGroup: 1, status: 1 });
bloodSchema.index({ expiryDate: 1 });

export default mongoose.model("Blood", bloodSchema);
