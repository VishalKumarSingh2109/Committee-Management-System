const { Op } = require('sequelize');
const { Member, Payment } = require('../models');

/**
 * Idempotent: for every active member, ensures a payment row exists for
 * the given month/year. If it already exists, leaves it untouched.
 * Called both by a scheduled cron (future) and lazily whenever the admin
 * opens the monthly payment page for a given month/year (Stage 12 logic,
 * exposed here so both call the same function).
 */
const ensureDuePaymentsForMonth = async (month, year) => {
  const activeMembers = await Member.findAll({ where: { status: 'active' } });

  const results = [];
  for (const member of activeMembers) {
    const [payment, created] = await Payment.findOrCreate({
      where: { member_id: member.id, month, year },
      defaults: {
        member_id: member.id,
        month,
        year,
        amount: member.monthly_fee,
        status: 'due',
      },
    });
    results.push({ payment, created });
  }

  return results;
};

/**
 * Member submits a transaction/reference ID against their due payment for
 * a month. Moves status due -> pending. Never sets it to 'paid' directly —
 * that only happens via admin verification.
 *
 * If no payment row exists yet for this member/month (e.g. the admin
 * hasn't opened the Monthly Table for this month), one is created here
 * with the member's current monthly fee — a member shouldn't be blocked
 * from paying just because nobody in the admin panel has looked at that
 * month yet.
 */
const submitPaymentReference = async ({ memberId, month, year, transactionId }) => {
  const member = await Member.findByPk(memberId);
  if (!member) {
    const err = new Error('Member profile not found');
    err.status = 404;
    throw err;
  }

  const [payment] = await Payment.findOrCreate({
    where: { member_id: memberId, month, year },
    defaults: {
      member_id: memberId,
      month,
      year,
      amount: member.monthly_fee,
      status: 'due',
    },
  });

  if (payment.status === 'paid') {
    const err = new Error('This payment has already been verified as paid.');
    err.status = 409;
    throw err;
  }

  await payment.update({
    transaction_id: transactionId,
    status: 'pending',
  });

  return payment;
};

/**
 * Admin verifies a pending payment, moving it to 'paid' and recording who
 * verified it and when.
 */
const verifyPayment = async ({ paymentId, adminUserId, paymentDate }) => {
  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    const err = new Error('Payment record not found');
    err.status = 404;
    throw err;
  }

  if (payment.status === 'paid') {
    const err = new Error('This payment has already been verified as paid.');
    err.status = 409;
    throw err;
  }

  if (payment.status === 'due') {
    const err = new Error('This member has not submitted a payment reference yet — nothing to verify.');
    err.status = 409;
    throw err;
  }

  await payment.update({
    status: 'paid',
    verified_by: adminUserId,
    payment_date: paymentDate || new Date().toISOString().slice(0, 10),
  });

  return payment;
};

module.exports = { ensureDuePaymentsForMonth, submitPaymentReference, verifyPayment };
