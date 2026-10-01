import mongoose from "mongoose";

import app from "./app.js";
import env from "./config/env.js";
import connectDatabase from "./config/database.js";

let server;

const startServer = async () => {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      console.log(`User Service running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start User Service:", error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    server.close(async () => {
      await mongoose.connection.close();

      console.log("MongoDB connection closed");
      console.log("Server shut down successfully");

      process.exit(0);
    });
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
