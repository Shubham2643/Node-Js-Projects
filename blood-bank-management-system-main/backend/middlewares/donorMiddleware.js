// middlewares/donorMiddleware.js
import jwt from "jsonwebtoken";
import Donor from "../models/donorModel.js";

export const protectDonor = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token stores the base User ID; donor documents reference it via `user` field
      const donor = await Donor.findOne({ user: decoded.id }).select(
        "-password",
      );

      if (!donor) {
        return res.status(401).json({
          success: false,
          message: "Donor not found",
        });
      }

      req.user = donor;
      req.user.id = donor._id;
      req.user.role = "donor";

      next();
    } catch (error) {
      console.error("Donor auth error:", error);
      res.status(401).json({
        success: false,
        message: "Token invalid or expired",
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }
};
