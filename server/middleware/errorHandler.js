const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({ error: 'Resource already exists' });
      case '23503': // Foreign key violation
        return res.status(400).json({ error: 'Referenced resource not found' });
      case '23502': // Not null violation
        return res.status(400).json({ error: 'Required field missing' });
      case '42P01': // Undefined table
        return res.status(500).json({ error: 'Database table not found' });
      default:
        return res.status(500).json({ error: 'Database error' });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Default error
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };