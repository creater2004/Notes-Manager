import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./src/config/database.js";

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error("Set MONGO_URI and JWT_SECRET in your .env file.");
  }

  await connectDatabase();
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

start().catch((error) => {
  console.error("Could not start server:", error.message);
  process.exitCode = 1;
});
