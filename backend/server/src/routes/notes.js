import express from "express";
import Note, { NOTE_CATEGORIES } from "../models/Note.js";
import asyncRoute from "../middleware/asyncRoute.js";
import requireLogin from "../middleware/requireLogin.js";

const router = express.Router();

router.use(requireLogin);

router.get("/", asyncRoute(async (req, res) => {
  const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.json(notes);
}));

router.post("/", asyncRoute(async (req, res) => {
  const { title, content, category = "Study" } = req.body ?? {};
  if (
    typeof title !== "string" ||
    typeof content !== "string" ||
    !title.trim() ||
    !content.trim() ||
    !NOTE_CATEGORIES.includes(category)
  ) {
    return res.status(400).json({ message: "Enter a title, content, and valid category." });
  }

  const note = await Note.create({ title, content, category, user: req.user.id });
  res.status(201).json(note);
}));

router.put("/:id", asyncRoute(async (req, res) => {
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
    if (!NOTE_CATEGORIES.includes(category)) {
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

router.delete("/:id", asyncRoute(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!note) {
    return res.status(404).json({ message: "Note not found." });
  }

  res.json({ message: "Note deleted successfully." });
}));

export default router;
