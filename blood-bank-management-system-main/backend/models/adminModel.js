// models/Admin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_facilities",
          "view_reports",
          "manage_system",
        ],
      },
    ],
    lastActive: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Admin", adminSchema);
