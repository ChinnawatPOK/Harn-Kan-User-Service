import AppError from "../shared/errors/app-error.js";
import { ErrorCodes } from "../shared/errors/error-codes.js";

const notFoundHandler = (req, res, next) => {
  next(new AppError(ErrorCodes.NOT_FOUND));
};

export default notFoundHandler;
