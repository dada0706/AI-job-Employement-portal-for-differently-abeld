import jwt from "jsonwebtoken";
import User from "../models/User.js";

const userAuthMiddleware = async (req, res, next) => {
  try {
    // Log request info to help find routing problems
    console.log(`[userAuthMiddleware] ${req.method} ${req.path} - checking auth`);

    // Accept multiple header styles
    const authHeader =
      req.headers.authorization || req.headers.token || req.headers["x-access-token"];

    console.log("[userAuthMiddleware] authHeader present:", !!authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized login again" });
    }

    // Strip "Bearer " if present
    const token =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    console.log("[userAuthMiddleware] token found:", !!token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized login again" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.userData = user;
    next();
  } catch (error) {
    console.error("[userAuthMiddleware] auth error:", error.message);
    return res.status(401).json({ message: "Unauthorized login again" });
  }
};

export default userAuthMiddleware;
