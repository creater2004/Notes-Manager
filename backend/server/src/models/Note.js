import mongoose from "mongoose";

export const NOTE_CATEGORIES = ["Study", "Personal", "Work", "Other"];

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    content: { type: String, required: true, trim: true },
    category: { type: String, enum: NOTE_CATEGORIES, default: "Study" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
