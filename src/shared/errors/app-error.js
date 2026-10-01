class AppError extends Error {
  constructor(errorDefinition, options = {}) {
    super(options.message ?? errorDefinition.message);

    this.name = "AppError";
    this.code = errorDefinition.code;
    this.statusCode = errorDefinition.statusCode;
    this.details = options.details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
