import { setTimeout } from "node:timers";
import mongoose from "mongoose";
import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import connectDatabase from "./config/database.js";
import { isShuttingDown, markShuttingDown } from "./shared/lifecycle.js";

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

const closeHttpServer = () =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });

    // Drop keep-alive sockets that are not serving a request,
    // otherwise close() waits for them to time out.
    server.closeIdleConnections();
  });

const shutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown()) {
    logger.warn({ signal }, "Shutdown already in progress");
    return;
  }

  markShuttingDown();
  logger.info({ signal }, "Shutdown signal received");

  // Last resort if in-flight requests or the DB close hang.
  const forceExitTimer = setTimeout(() => {
    logger.error(
      { timeoutMs: env.SHUTDOWN_TIMEOUT_MS },
      "Graceful shutdown timed out, forcing exit"
    );
    server?.closeAllConnections();
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  try {
    if (server) {
      await closeHttpServer();

      logger.info("HTTP server closed");
    }

    await mongoose.connection.close();

    logger.info("MongoDB connection closed");
    logger.info("User Service shutdown completed");

    process.exit(exitCode);
  } catch (error) {
    logger.error({ err: error }, "Error during graceful shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  shutdown("uncaughtException", 1);
});

startServer();
