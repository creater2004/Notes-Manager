import cors from "cors";
import express from "express";
import authRoutes from "./src/routes/auth.js";
import noteRoutes from "./src/routes/notes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error.status === 400) {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid or expired login. Please log in again." });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "Invalid request data." });
  }

  res.status(500).json({ message: "Server error." });
});

export default app;
