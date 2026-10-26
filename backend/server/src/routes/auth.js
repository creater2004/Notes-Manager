import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncRoute from "../middleware/asyncRoute.js";
import requireLogin from "../middleware/requireLogin.js";

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", asyncRoute(async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim()
  ) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  if (password.length < 6 || password.length > 128) {
    return res.status(400).json({ message: "Password must be between 6 and 128 characters." });
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: await bcrypt.hash(password, 10),
  });

  res.status(201).json({
    message: "Account created successfully!",
    token: createToken(user.id),
    user: { _id: user.id, name: user.name, email: user.email },
  });
}));

router.post("/login", asyncRoute(async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({
    message: "Login successful!",
    token: createToken(user.id),
    user: { _id: user.id, name: user.name, email: user.email },
  });
}));

router.get("/me", requireLogin, (req, res) => {
  res.json({
    user: { _id: req.user.id, name: req.user.name, email: req.user.email },
  });
});

export default router;
