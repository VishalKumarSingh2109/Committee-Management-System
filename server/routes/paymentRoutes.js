const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getPayments,
  getMemberPayments,
  submitPayment,
  updatePayment,
  verifyPaymentHandler,
  getMonthlyPayments,
  getPaymentsDirectory,
  downloadReceipt,
  exportPayments,
} = require('../controllers/paymentController');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

// Every payment route requires login; specific role checks are per-route below.
router.use(authMiddleware);

// Any authenticated member (or admin) can see the club-wide paid/due directory.
router.get('/directory', getPaymentsDirectory);

// ── Admin-only ────────────────────────────────────────────────
router.get('/', requireRole('admin'), getPayments);
router.get('/monthly', requireRole('admin'), getMonthlyPayments);
router.get('/export', requireRole('admin'), exportPayments);

router.put(
  '/:id',
  requireRole('admin'),
  [
    param('id').isInt().withMessage('Invalid payment id'),
    body('amount').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['paid', 'due', 'pending']),
    body('payment_date').optional().isISO8601().withMessage('Payment date must be a valid date'),
    body('transaction_id').optional().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  updatePayment
);

router.put(
  '/:id/verify',
  requireRole('admin'),
  [param('id').isInt().withMessage('Invalid payment id'), body('payment_date').optional().isISO8601()],
  validateRequest,
  verifyPaymentHandler
);

// ── Admin + Member (ownership enforced inside the controller) ──
router.get(
  '/:id/receipt',
  param('id').isInt().withMessage('Invalid payment id'),
  validateRequest,
  downloadReceipt
);

router.get(
  '/member/:memberId',
  param('memberId').isInt().withMessage('Invalid member id'),
  validateRequest,
  getMemberPayments
);

router.post(
  '/',
  [
    body('month').isInt({ min: 1, max: 12 }).withMessage('month must be 1-12'),
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('year must be a valid year'),
    body('transaction_id').trim().notEmpty().isLength({ max: 100 }).withMessage('Transaction/reference ID is required'),
  ],
  validateRequest,
  submitPayment
);

module.exports = router;
