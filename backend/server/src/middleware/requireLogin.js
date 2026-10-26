import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncRoute from "./asyncRoute.js";

const requireLogin = asyncRoute(async (req, res, next) => {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Please log in first." });
  }

  const { userId } = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(userId);
  if (!req.user) {
    return res.status(401).json({ message: "Please log in first." });
  }

  next();
});

export default requireLogin;
