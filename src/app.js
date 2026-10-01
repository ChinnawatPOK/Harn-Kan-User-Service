import express from "express";
import cors from "cors";
import helmet from "helmet";
import env from "./config/env.js";
import healthRoutes from "./health/health.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/user/user.route.js";
import notFoundHandler from "./middleware/not-found.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

// Operational endpoints
app.use("/health", healthRoutes);

// Application APIs
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
