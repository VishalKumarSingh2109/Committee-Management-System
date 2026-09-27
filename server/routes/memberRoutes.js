const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getOwnMember,
  resetPassword,
} = require('../controllers/memberController');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

// Every route below needs a logged-in user.
router.use(authMiddleware);

// Any authenticated member can read their own profile.
router.get('/me', getOwnMember);

// Everything past this point is admin-only.
router.use(requireRole('admin'));

router.get('/', getMembers);
router.get('/:id', param('id').isInt().withMessage('Invalid member id'), validateRequest, getMemberById);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('phone')
      .trim()
      .matches(/^\d{7,15}$/)
      .withMessage('Phone number must be 7-15 digits'),
    body('join_date').isISO8601().withMessage('Join date must be a valid date (YYYY-MM-DD)'),
    body('monthly_fee').isFloat({ min: 0 }).withMessage('Monthly fee must be a positive number'),
  ],
  validateRequest,
  createMember
);

router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid member id'),
    body('phone')
      .optional()
      .trim()
      .matches(/^\d{7,15}$/)
      .withMessage('Phone number must be 7-15 digits'),
    body('join_date').optional().isISO8601().withMessage('Join date must be a valid date'),
    body('monthly_fee').optional().isFloat({ min: 0 }).withMessage('Monthly fee must be a positive number'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  ],
  validateRequest,
  updateMember
);

router.delete('/:id', param('id').isInt().withMessage('Invalid member id'), validateRequest, deleteMember);

router.put(
  '/:id/reset-password',
  param('id').isInt().withMessage('Invalid member id'),
  validateRequest,
  resetPassword
);

module.exports = router;
