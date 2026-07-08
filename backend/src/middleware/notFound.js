// backend/src/middleware/notFound.js
const ApiError = require('../utils/ApiError');

// Catches any request that didn't match a route above this middleware.
function notFound(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

module.exports = notFound;