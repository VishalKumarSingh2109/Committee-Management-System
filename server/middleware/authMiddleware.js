const { verifyToken } = require('../services/authService');
const { error } = require('../utils/apiResponse');

/**
 * Expects: Authorization: Bearer <token>
 * On success, attaches req.user = { id, role, name, email }
 */
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return error(res, { message: 'No token provided', status: 401 });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, { message: 'Invalid or expired token', status: 401 });
  }
};

module.exports = authMiddleware;
