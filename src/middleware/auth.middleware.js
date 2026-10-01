import { tokenService } from "../security/token.service.js";
import AppError from "../shared/errors/app-error.js";
import { ErrorCodes } from "../shared/errors/error-codes.js";

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.trim().split(/\s+/);

  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return null;
  }

  return parts[1];
};

const authenticate = (req, res, next) => {
  const token = extractBearerToken(req.get("Authorization"));

  if (!token) {
    return next(new AppError(ErrorCodes.UNAUTHORIZED));
  }

  const payload = tokenService.verifyAccessToken(token);

  if (typeof payload !== "object" || typeof payload.sub !== "string") {
    return next(new AppError(ErrorCodes.INVALID_TOKEN));
  }

  req.auth = {
    userId: payload.sub,
  };

  return next();
};

export default authenticate;
