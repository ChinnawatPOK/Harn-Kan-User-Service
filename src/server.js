import mongoose from "mongoose";

import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import connectDatabase from "./config/database.js";

let server;

const startServer = async () => {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
        },
        "User Service started"
      );
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start User Service");
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.info({ signal }, "Shutdown signal received");

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      logger.info("HTTP server closed");
    }

    await mongoose.connection.close();

    logger.info("MongoDB connection closed");
    logger.info("User Service shutdown completed");

    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Error during graceful shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
