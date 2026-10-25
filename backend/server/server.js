import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 5000;
const CATEGORIES = ["Study", "Personal", "Work", "Other"];

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
});

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    content: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, default: "Study" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
const Note = mongoose.model("Note", noteSchema);
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

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

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/auth/register", asyncRoute(async (req, res) => {
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

app.post("/api/auth/login", asyncRoute(async (req, res) => {
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

app.get("/api/auth/me", requireLogin, (req, res) => {
  res.json({
    user: { _id: req.user.id, name: req.user.name, email: req.user.email },
  });
});

app.get("/api/notes", requireLogin, asyncRoute(async (req, res) => {
  const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.json(notes);
}));

app.post("/api/notes", requireLogin, asyncRoute(async (req, res) => {
  const { title, content, category = "Study" } = req.body ?? {};
  if (
    typeof title !== "string" ||
    typeof content !== "string" ||
    !title.trim() ||
    !content.trim() ||
    !CATEGORIES.includes(category)
  ) {
    return res.status(400).json({ message: "Enter a title, content, and valid category." });
  }

  const note = await Note.create({ title, content, category, user: req.user.id });
  res.status(201).json(note);
}));

app.put("/api/notes/:id", requireLogin, asyncRoute(async (req, res) => {
  const { title, content, category } = req.body ?? {};
  const update = {};
  if (req.body && Object.hasOwn(req.body, "title")) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title cannot be empty." });
    }
    update.title = title;
  }
  if (req.body && Object.hasOwn(req.body, "content")) {
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Content cannot be empty." });
    }
    update.content = content;
  }
  if (req.body && Object.hasOwn(req.body, "category")) {
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Choose a valid category." });
    }
    update.category = category;
  }
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: "Enter a title, content, and valid category." });
  }

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    update,
    { new: true, runValidators: true },
  );
  if (!note) {
    return res.status(404).json({ message: "Note not found." });
  }

  res.json(note);
}));

app.delete("/api/notes/:id", requireLogin, asyncRoute(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!note) {
    return res.status(404).json({ message: "Note not found." });
  }
  res.json({ message: "Note deleted successfully." });
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.status === 400) {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  if (error instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ message: "Invalid or expired login. Please log in again." });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "Invalid request data." });
  }
  res.status(500).json({ message: "Server error." });
});

async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error("Set MONGO_URI and JWT_SECRET in your .env file.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas.");
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

start().catch((error) => {
  console.error("Could not start server:", error.message);
  process.exitCode = 1;
});
