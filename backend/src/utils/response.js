/**
 * Standardized API response formatter
 */
export const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendSuccess = (res, message, data = null, meta = null) => {
  return sendResponse(res, 200, true, message, data, meta);
};

export const sendCreated = (res, message, data = null) => {
  return sendResponse(res, 201, true, message, data);
};

export const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

