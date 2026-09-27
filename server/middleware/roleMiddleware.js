const { error } = require('../utils/apiResponse');

/**
 * Usage: router.get('/admin-only', authMiddleware, requireRole('admin'), handler)
 * Must run AFTER authMiddleware, since it relies on req.user.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, { message: 'Not authenticated', status: 401 });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, { message: 'You do not have permission to do this', status: 403 });
    }
    next();
  };
};

module.exports = requireRole;
