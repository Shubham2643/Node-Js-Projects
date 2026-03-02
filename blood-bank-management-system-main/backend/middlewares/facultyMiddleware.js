import jwt from "jsonwebtoken";
import faculty from "../models/facultyModel.js";

export const protectfaculty = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" }); // <--- This is the source of the 401
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const faculty = await faculty.findById(decoded.id).select("-password");
    if (!faculty) {
      return res.status(404).json({ message: "faculty not found" });
    }

    req.user = faculty;
    next();
  } catch (error) {
    console.error("faculty Auth Error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
