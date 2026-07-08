// backend/src/utils/ApiError.js
// A small, explicit error type so the error-handling middleware can tell
// "expected" failures (bad input, 404s) apart from genuine bugs/crashes.
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // e.g. { fullName: "Too short" } for validation errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;