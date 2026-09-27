const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

/**
 * Drop this after express-validator's validation chains in a route:
 *   router.post('/login', [body('email').isEmail(), ...], validateRequest, controller)
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, {
      message: 'Validation failed',
      status: 422,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validateRequest;
