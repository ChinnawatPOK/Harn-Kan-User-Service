import jwt from "jsonwebtoken";
import env from "../config/env.js";
import AppError from "../shared/errors/app-error.js";
import { ErrorCodes } from "../shared/errors/error-codes.js";

const generateAccessToken = (userId, name) => {
  const id = String(userId);
  return jwt.sign({ id, ...(name ? { name } : {}) }, env.JWT_SECRET, {
    subject: id,
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(ErrorCodes.TOKEN_EXPIRED);
    }
    throw new AppError(ErrorCodes.INVALID_TOKEN);
  }
};

export const tokenService = {
  generateAccessToken,
  verifyAccessToken,
};
