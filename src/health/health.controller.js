import mongoose from "mongoose";

import { isShuttingDown } from "../shared/lifecycle.js";

export const health = (req, res) => {
  return res.status(200).json({
    status: "UP",
    service: "user-service",
  });
};

export const liveness = (req, res) => {
  return res.status(200).json({
    status: "UP",
    service: "user-service",
  });
};

export const readiness = (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;

  if (isShuttingDown()) {
    return res.status(503).json({
      status: "SHUTTING_DOWN",
      service: "user-service",
      database: databaseReady ? "UP" : "DOWN",
    });
  }

  if (!databaseReady) {
    return res.status(503).json({
      status: "DOWN",
      service: "user-service",
      database: "DOWN",
    });
  }

  return res.status(200).json({
    status: "UP",
    service: "user-service",
    database: "UP",
  });
};
