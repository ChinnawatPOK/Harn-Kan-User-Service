import mongoose from "mongoose";

import env from "./env.js";

const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    throw error;
  }
};

export default connectDatabase;
