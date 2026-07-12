const ApiError = require('../utils/ApiError');

function createRateLimit({ windowMs, maxRequests }) {
  const hits = new Map();

  return function rateLimit(req, res, next) {
    const forwardedFor = req.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : req.ip;
    const key = `${req.method}:${req.originalUrl}:${ip}`;
    const now = Date.now();
    const record = hits.get(key);

    if (!record || record.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return next(new ApiError(429, 'Too many requests. Please try again later.'));
    }

    record.count += 1;
    hits.set(key, record);
    return next();
  };
}

module.exports = createRateLimit;
