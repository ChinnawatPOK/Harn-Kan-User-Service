import pino from "pino";
import env from "./env.js";

const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: "user-service",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
      "*.password",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
});

export default logger;
