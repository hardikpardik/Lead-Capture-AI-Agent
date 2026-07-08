// backend/src/middleware/errorHandler.js
const ApiError = require('../utils/ApiError');

// Centralized error handler — the single place that decides what status
// code and message the client sees. Must be registered LAST in app.js.
//
// Express 5 automatically forwards both thrown errors and rejected
// promises from async route handlers here, so controllers don't need
// their own try/catch blocks for the "happy path" failures.
function errorHandler(err, req, res, next) {
  // Errors we raised on purpose (validation, not found, etc.)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // Common Postgres error codes worth translating into friendlier responses.
  if (err.code === '23505') {
    // unique_violation
    return res.status(409).json({
      success: false,
      message: 'This record already exists.',
    });
  }

  // Anything else is unexpected: log full detail server-side, but never
  // leak stack traces or internals to the client.
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again later.',
  });
}

module.exports = errorHandler;