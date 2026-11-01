import { sendError } from '../utils/response.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  if (err?.statusCode && err.statusCode < 500) {
    console.warn('Request error:', {
      method: req.method,
      url: req.originalUrl,
      statusCode: err.statusCode,
      message: err.message,
    });
  } else {
    console.error('Error:', err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return sendError(res, 400, 'Validation error', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, 409, `${field} already exists`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired');
  }

  // Custom application errors
  if (err.statusCode) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  // Default server error
  return sendError(
    res,
    500,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  );
};

/**
 * 404 Not Found middleware
 */
export const notFound = (req, res) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found`);
};
