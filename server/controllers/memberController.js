const { Op } = require('sequelize');
const sendError = require('../utils/handleError');
const { Member, User } = require('../models');
const { createMemberWithAccount, resetMemberPassword } = require('../services/memberService');
const { success, error } = require('../utils/apiResponse');

/**
 * GET /api/members
 * Query params: search, status, page, limit
 */
const getMembers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Member.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return success(res, {
      data: {
        members: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * GET /api/members/:id
 */
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'email', 'is_active'] }],
    });
    if (!member) {
      return error(res, { message: 'Member not found', status: 404 });
    }
    return success(res, { data: member });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * POST /api/members
 * Creates the Member profile AND its linked login account together.
 */
const createMember = async (req, res) => {
  try {
    const member = await createMemberWithAccount(req.body);
    return success(res, { message: 'Member created successfully', status: 201, data: member });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * PUT /api/members/:id
 * Updates the member profile. Does not touch login credentials/password.
 */
const updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return error(res, { message: 'Member not found', status: 404 });
    }

    const { name, phone, address, join_date, monthly_fee, status } = req.body;
    await member.update({
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(join_date !== undefined && { join_date }),
      ...(monthly_fee !== undefined && { monthly_fee }),
      ...(status !== undefined && { status }),
    });

    return success(res, { message: 'Member updated successfully', data: member });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * DELETE /api/members/:id
 * Soft-deletes by default (status → inactive), which is the safe real-world
 * default so payment history isn't lost. Pass ?hard=true to actually remove
 * the row (cascades to payments) — used rarely, e.g. a mistaken entry.
 */
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return error(res, { message: 'Member not found', status: 404 });
    }

    if (req.query.hard === 'true') {
      await member.destroy(); // cascades to payments via FK
      return success(res, { message: 'Member permanently deleted' });
    }

    await member.update({ status: 'inactive' });
    return success(res, { message: 'Member deactivated', data: member });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * GET /api/members/me
 * Returns the Member profile linked to the currently logged-in user.
 * Open to any authenticated member — this is how they see their own fee,
 * join date, etc. without needing admin-only member access.
 */
const getOwnMember = async (req, res) => {
  try {
    const member = await Member.findOne({ where: { user_id: req.user.id } });
    if (!member) {
      return error(res, { message: 'No member profile linked to this account', status: 404 });
    }
    return success(res, { data: member });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * PUT /api/members/:id/reset-password  (admin)
 * Generates a new random password for this member's login account and
 * returns it once, in the response — the admin relays it to the member.
 */
const resetPassword = async (req, res) => {
  try {
    const result = await resetMemberPassword(req.params.id);
    return success(res, { message: 'Password reset successfully', data: result });
  } catch (err) {
    return sendError(res, err);
  }
};

module.exports = { getMembers, getMemberById, createMember, updateMember, deleteMember, getOwnMember, resetPassword };
