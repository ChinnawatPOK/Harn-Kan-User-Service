import AppError from "../shared/errors/app-error.js";
import { ErrorCodes } from "../shared/errors/error-codes.js";
import env from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    const response = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if (err.details !== undefined) {
      response.error.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  console.error(err);

  const internalError = ErrorCodes.INTERNAL_SERVER_ERROR;

  const response = {
    success: false,
    error: {
      code: internalError.code,
      message: internalError.message,
    },
  };

  if (env.NODE_ENV === "development") {
    response.error.stack = err.stack;
  }

  return res.status(internalError.statusCode).json(response);
};

export default errorHandler;
