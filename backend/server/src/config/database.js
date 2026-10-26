import mongoose from "mongoose";

async function connectDatabase() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas.");
}

export default connectDatabase;
