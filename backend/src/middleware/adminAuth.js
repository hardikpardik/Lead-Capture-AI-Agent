const ApiError = require('../utils/ApiError');

function adminAuth(req, res, next) {
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return next();
  }

  const providedToken = req.get('x-admin-token');

  if (providedToken && providedToken === expectedToken) {
    return next();
  }

  return next(new ApiError(401, 'Admin token is required.'));
}

module.exports = adminAuth;
