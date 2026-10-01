export const ErrorCodes = {
  BAD_REQUEST: {
    code: "BAD_REQUEST",
    statusCode: 400,
    message: "Bad request",
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    statusCode: 400,
    message: "Invalid request data",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    statusCode: 401,
    message: "Authentication required",
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    statusCode: 401,
    message: "Invalid credentials",
  },
  INVALID_TOKEN: {
    code: "INVALID_TOKEN",
    statusCode: 401,
    message: "Invalid authentication token",
  },
  TOKEN_EXPIRED: {
    code: "TOKEN_EXPIRED",
    statusCode: 401,
    message: "Authentication token has expired",
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    statusCode: 403,
    message: "Access denied",
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    statusCode: 404,
    message: "Resource not found",
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    statusCode: 404,
    message: "User not found",
  },
  CONFLICT: {
    code: "CONFLICT",
    statusCode: 409,
    message: "Resource conflict",
  },
  PHONE_ALREADY_REGISTERED: {
    code: "PHONE_ALREADY_REGISTERED",
    statusCode: 409,
    message: "Phone number already registered",
  },
  TOO_MANY_REQUESTS: {
    code: "TOO_MANY_REQUESTS",
    statusCode: 429,
    message: "Too many requests",
  },
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    statusCode: 500,
    message: "Internal server error",
  },
  SERVICE_UNAVAILABLE: {
    code: "SERVICE_UNAVAILABLE",
    statusCode: 503,
    message: "Service temporarily unavailable",
  },
};
