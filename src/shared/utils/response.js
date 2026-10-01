export const successResponse = (res, { statusCode = 200, message, data, meta } = {}) => {
  const response = {
    success: true,
  };

  if (message !== undefined) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};
