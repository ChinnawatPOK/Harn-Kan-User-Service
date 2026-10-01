import AppError from "../shared/errors/app-error.js";
import { ErrorCodes } from "../shared/errors/error-codes.js";

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(
        new AppError(ErrorCodes.VALIDATION_ERROR, {
          details,
        })
      );
    }

    req.validated = result.data;

    next();
  };
};

export default validate;
