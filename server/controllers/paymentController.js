const { Member, Payment, User } = require('../models');
const sendError = require('../utils/handleError');
const { ensureDuePaymentsForMonth, submitPaymentReference, verifyPayment } = require('../services/paymentService');
const { success, error } = require('../utils/apiResponse');
const { generateReceiptPdf } = require('../utils/receiptService');
const { toCsv } = require('../utils/csvHelper');
const { MONTH_NAMES } = require('../utils/monthNames');

/** Resolves the Member row that belongs to the currently logged-in User. */
const getOwnMember = async (userId) => {
  return Member.findOne({ where: { user_id: userId } });
};

/**
 * GET /api/payments  (admin)
 * Filters: status, month, year, member_id
 */
const getPayments = async (req, res) => {
  try {
    const { status, month, year, member_id, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (month) where.month = month;
    if (year) where.year = year;
    if (member_id) where.member_id = member_id;

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Payment.findAndCountAll({
      where,
      include: [{ model: Member, attributes: ['id', 'name', 'email', 'phone'] }],
      limit: Number(limit),
      offset,
      order: [['year', 'DESC'], ['month', 'DESC'], ['created_at', 'DESC']],
    });

    return success(res, {
      data: {
        payments: rows,
        pagination: { total: count, page: Number(page), limit: Number(limit), totalPages: Math.ceil(count / Number(limit)) },
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * GET /api/payments/member/:memberId
 * Admin can view any member's history. A member can only view their own —
 * enforced here rather than relying solely on the route's role middleware.
 */
const getMemberPayments = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (req.user.role === 'member') {
      const own = await getOwnMember(req.user.id);
      if (!own || String(own.id) !== String(memberId)) {
        return error(res, { message: 'You can only view your own payment history', status: 403 });
      }
    }

    const payments = await Payment.findAll({
      where: { member_id: memberId },
      order: [['year', 'DESC'], ['month', 'DESC']],
    });

    const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
    const totalDue = payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + Number(p.amount), 0);

    return success(res, {
      data: {
        payments,
        summary: {
          totalPaid,
          totalDue,
          monthsPaid: payments.filter((p) => p.status === 'paid').length,
          monthsDue: payments.filter((p) => p.status !== 'paid').length,
        },
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * POST /api/payments
 * Member submits a transaction/reference ID for a given month. Sets
 * status -> 'pending'. Never auto-marks as paid (workflow rule).
 */
const submitPayment = async (req, res) => {
  try {
    const { month, year, transaction_id } = req.body;

    const member = await getOwnMember(req.user.id);
    if (!member) {
      return error(res, { message: 'No member profile linked to this account', status: 404 });
    }

    const payment = await submitPaymentReference({
      memberId: member.id,
      month,
      year,
      transactionId: transaction_id,
    });

    return success(res, { message: 'Payment submitted for verification', data: payment });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * PUT /api/payments/:id  (admin)
 * General edit — e.g. correcting the amount, or manually resetting a
 * mistaken submission back to 'due'.
 */
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return error(res, { message: 'Payment record not found', status: 404 });
    }

    const { amount, status, payment_date, transaction_id } = req.body;
    await payment.update({
      ...(amount !== undefined && { amount }),
      ...(status !== undefined && { status }),
      ...(payment_date !== undefined && { payment_date }),
      ...(transaction_id !== undefined && { transaction_id }),
    });

    return success(res, { message: 'Payment updated', data: payment });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * PUT /api/payments/:id/verify  (admin)
 * The one place status ever becomes 'paid'.
 */
const verifyPaymentHandler = async (req, res) => {
  try {
    const payment = await verifyPayment({
      paymentId: req.params.id,
      adminUserId: req.user.id,
      paymentDate: req.body.payment_date,
    });
    return success(res, { message: 'Payment verified and marked as paid', data: payment });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * GET /api/payments/monthly?month=&year=  (admin)
 * Ensures due records exist for every active member for that month
 * (Stage 12's "auto-create on page open" fallback), then returns the
 * full table plus summary totals.
 */
const getMonthlyPayments = async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return error(res, { message: 'month and year query params are required', status: 422 });
    }

    await ensureDuePaymentsForMonth(month, year);

    const payments = await Payment.findAll({
      where: { month, year },
      include: [{ model: Member, attributes: ['id', 'name', 'phone', 'monthly_fee'] }],
      order: [[Member, 'name', 'ASC']],
    });

    const totalCollected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
    const totalDue = payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + Number(p.amount), 0);

    return success(res, {
      data: {
        month,
        year,
        payments,
        summary: {
          totalMembers: payments.length,
          totalCollected,
          totalDue,
          paidCount: payments.filter((p) => p.status === 'paid').length,
          dueCount: payments.filter((p) => p.status !== 'paid').length,
        },
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * GET /api/payments/directory?month=&year=
 * Any authenticated member (or admin) can see who in the club has paid
 * and who hasn't for a given month — name + status only, no phone/email,
 * since this is visible to fellow members, not just the admin.
 */
const getPaymentsDirectory = async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return error(res, { message: 'month and year query params are required', status: 422 });
    }

    await ensureDuePaymentsForMonth(month, year);

    const payments = await Payment.findAll({
      where: { month, year },
      include: [{ model: Member, attributes: ['id', 'name'] }],
      order: [[Member, 'name', 'ASC']],
    });

    const directory = payments.map((p) => ({
      member_id: p.member_id,
      name: p.Member?.name,
      status: p.status,
    }));

    return success(res, { data: { month, year, members: directory } });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * GET /api/payments/:id/receipt
 * Admin can download any receipt; a member can only download their own.
 * Only makes sense for a payment that's actually been verified as paid.
 */
const downloadReceipt = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, { include: [{ model: Member }] });
    if (!payment) {
      return error(res, { message: 'Payment record not found', status: 404 });
    }

    if (req.user.role === 'member') {
      const own = await Member.findOne({ where: { user_id: req.user.id } });
      if (!own || own.id !== payment.member_id) {
        return error(res, { message: 'You can only download your own receipts', status: 403 });
      }
    }

    if (payment.status !== 'paid') {
      return error(res, { message: 'A receipt is only available once a payment is verified as paid', status: 409 });
    }

    const pdfBuffer = await generateReceiptPdf({ payment, member: payment.Member });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="receipt-${payment.Member.name.replace(/\s+/g, '_')}-${payment.month}-${payment.year}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * GET /api/payments/export?month=&year=&status=  (admin)
 * Downloads the filtered payment list as a CSV file.
 */
const exportPayments = async (req, res) => {
  try {
    const { status, month, year } = req.query;
    const where = {};
    if (status) where.status = status;
    if (month) where.month = month;
    if (year) where.year = year;

    const payments = await Payment.findAll({
      where,
      include: [{ model: Member, attributes: ['name', 'phone'] }],
      order: [['year', 'DESC'], ['month', 'DESC']],
    });

    const rows = payments.map((p) => ({
      member: p.Member?.name,
      phone: p.Member?.phone,
      month: MONTH_NAMES[p.month - 1],
      year: p.year,
      amount: p.amount,
      status: p.status,
      payment_date: p.payment_date || '',
      transaction_id: p.transaction_id || '',
    }));

    const csv = toCsv(rows, [
      { key: 'member', header: 'Member' },
      { key: 'phone', header: 'Phone' },
      { key: 'month', header: 'Month' },
      { key: 'year', header: 'Year' },
      { key: 'amount', header: 'Amount' },
      { key: 'status', header: 'Status' },
      { key: 'payment_date', header: 'Payment Date' },
      { key: 'transaction_id', header: 'Transaction ID' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments-export.csv"');
    return res.send(csv);
  } catch (err) {
    return sendError(res, err);
  }
};

module.exports = {
  getPayments,
  getMemberPayments,
  submitPayment,
  updatePayment,
  verifyPaymentHandler,
  getMonthlyPayments,
  getPaymentsDirectory,
  downloadReceipt,
  exportPayments,
};
