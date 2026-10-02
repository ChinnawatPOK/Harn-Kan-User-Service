import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";

import logger from "../config/logger.js";

const requestLogger = pinoHttp({
  logger,

  genReqId: (req, res) => {
    const requestId = req.headers["x-request-id"] || randomUUID();

    res.setHeader("x-request-id", requestId);

    return requestId;
  },

  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      userAgent: req.headers["user-agent"],
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  // Skip noisy probes from Docker / orchestrator health checks
  autoLogging: {
    ignore: (req) => req.url.startsWith("/health"),
  },
});

export default requestLogger;
