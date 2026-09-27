const { Op, fn, col, literal } = require('sequelize');
const { Member, Payment } = require('../models');

/**
 * Dashboard summary cards: total members, current month collection/due,
 * paid vs due member counts — all for "now" (server's current month/year).
 */
const getSummary = async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const totalMembers = await Member.count({ where: { status: 'active' } });

  const currentMonthPayments = await Payment.findAll({ where: { month, year } });

  const currentMonthCollection = currentMonthPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const currentMonthDue = currentMonthPayments
    .filter((p) => p.status !== 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const paidMembers = currentMonthPayments.filter((p) => p.status === 'paid').length;
  const dueMembers = currentMonthPayments.filter((p) => p.status !== 'paid').length;

  return {
    month,
    year,
    totalMembers,
    currentMonthCollection,
    currentMonthDue,
    paidMembers,
    dueMembers,
  };
};

/**
 * Monthly collection for a given year — feeds the bar/line charts.
 * Returns all 12 months, with 0 for months that have no records yet.
 */
const getMonthlyStatistics = async (year) => {
  const rows = await Payment.findAll({
    attributes: [
      'month',
      [fn('SUM', literal(`CASE WHEN status = 'paid' THEN amount ELSE 0 END`)), 'collected'],
      [fn('SUM', literal(`CASE WHEN status != 'paid' THEN amount ELSE 0 END`)), 'due'],
    ],
    where: { year },
    group: ['month'],
    raw: true,
  });

  const byMonth = {};
  rows.forEach((r) => {
    byMonth[r.month] = { collected: Number(r.collected) || 0, due: Number(r.due) || 0 };
  });

  const months = [];
  for (let m = 1; m <= 12; m++) {
    months.push({
      month: m,
      collected: byMonth[m]?.collected || 0,
      due: byMonth[m]?.due || 0,
    });
  }

  const totalPaidCount = await Payment.count({ where: { year, status: 'paid' } });
  const totalDueCount = await Payment.count({ where: { year, status: { [Op.ne]: 'paid' } } });

  return { year, months, paidVsDue: { paid: totalPaidCount, due: totalDueCount } };
};

/**
 * Per-member statistics — total paid/due, months paid/due, and full
 * payment trend for that member (used by the member detail chart).
 */
const getMemberStatistics = async (memberId) => {
  const member = await Member.findByPk(memberId);
  if (!member) {
    const err = new Error('Member not found');
    err.status = 404;
    throw err;
  }

  const payments = await Payment.findAll({
    where: { member_id: memberId },
    order: [['year', 'ASC'], ['month', 'ASC']],
  });

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const totalDue = payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + Number(p.amount), 0);

  return {
    member: { id: member.id, name: member.name, monthly_fee: member.monthly_fee },
    totalPaid,
    totalDue,
    paidMonths: payments.filter((p) => p.status === 'paid').length,
    dueMonths: payments.filter((p) => p.status !== 'paid').length,
    trend: payments.map((p) => ({
      month: p.month,
      year: p.year,
      amount: Number(p.amount),
      status: p.status,
    })),
  };
};

/**
 * Member-wise statistics table for the Reports page — every member's
 * paid/due totals side by side.
 */
const getAllMembersStatistics = async () => {
  const members = await Member.findAll({ where: { status: 'active' } });

  const stats = await Promise.all(
    members.map(async (member) => {
      const payments = await Payment.findAll({ where: { member_id: member.id } });
      const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
      const totalDue = payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + Number(p.amount), 0);
      return {
        member_id: member.id,
        name: member.name,
        totalPaid,
        totalDue,
        paidMonths: payments.filter((p) => p.status === 'paid').length,
        dueMonths: payments.filter((p) => p.status !== 'paid').length,
      };
    })
  );

  return stats;
};

module.exports = { getSummary, getMonthlyStatistics, getMemberStatistics, getAllMembersStatistics };
