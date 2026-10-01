import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Security
app.use(helmet());
app.use(cors());

// Request parsing
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "user-service",
  });
});

// API
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

export default app;
