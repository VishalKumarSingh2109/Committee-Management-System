const {
  getSummary,
  getMonthlyStatistics,
  getMemberStatistics,
  getAllMembersStatistics,
} = require('../services/statisticsService');
const { Member } = require('../models');
const { success, error } = require('../utils/apiResponse');
const sendError = require('../utils/handleError');
const { toCsv } = require('../utils/csvHelper');

/** GET /api/statistics/summary */
const summary = async (req, res) => {
  try {
    const data = await getSummary();
    return success(res, { data });
  } catch (err) {
    return sendError(res, err);
  }
};

/** GET /api/statistics/monthly?year= */
const monthly = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const data = await getMonthlyStatistics(year);
    return success(res, { data });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * GET /api/statistics/member/:memberId
 * Admin can view any member; a member can only view their own.
 */
const memberStats = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (req.user.role === 'member') {
      const own = await Member.findOne({ where: { user_id: req.user.id } });
      if (!own || String(own.id) !== String(memberId)) {
        return error(res, { message: 'You can only view your own statistics', status: 403 });
      }
    }

    const data = await getMemberStatistics(memberId);
    return success(res, { data });
  } catch (err) {
    return sendError(res, err);
  }
};

/** GET /api/statistics/members  (admin) — member-wise table for Reports page */
const allMembersStats = async (req, res) => {
  try {
    const data = await getAllMembersStatistics();
    return success(res, { data });
  } catch (err) {
    return sendError(res, err);
  }
};

/** GET /api/statistics/members/export  (admin) — member-wise stats as CSV */
const exportMembersCsv = async (req, res) => {
  try {
    const stats = await getAllMembersStatistics();
    const csv = toCsv(stats, [
      { key: 'name', header: 'Member' },
      { key: 'totalPaid', header: 'Total Paid' },
      { key: 'totalDue', header: 'Total Due' },
      { key: 'paidMonths', header: 'Paid Months' },
      { key: 'dueMonths', header: 'Due Months' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="member-statistics.csv"');
    return res.send(csv);
  } catch (err) {
    return sendError(res, err);
  }
};

module.exports = { summary, monthly, memberStats, allMembersStats, exportMembersCsv };
