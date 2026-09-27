const { User } = require('../models');
const sendError = require('../utils/handleError');
const { hashPassword, comparePassword, generateToken } = require('../services/authService');
const { success, error } = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 * Creates a login account. In practice this is mostly used by the admin
 * when adding a new member (Stage 5), but is exposed here as a standalone
 * endpoint too. Role defaults to 'member' — an admin account should be
 * created once via the seed script, not through open registration.
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return error(res, { message: 'An account with this email already exists', status: 409 });
    }

    const hashed = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role === 'admin' ? 'admin' : 'member', // never trust client to self-promote
    });

    const token = generateToken(user);

    return success(res, {
      message: 'Account created successfully',
      status: 201,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return error(res, { message: 'Invalid email or password', status: 401 });
    }

    if (!user.is_active) {
      return error(res, { message: 'This account has been deactivated', status: 403 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return error(res, { message: 'Invalid email or password', status: 401 });
    }

    const token = generateToken(user);

    return success(res, {
      message: 'Login successful',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently logged-in user based on the JWT (set by authMiddleware).
 */
const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'is_active'],
    });
    if (!user) {
      return error(res, { message: 'User not found', status: 404 });
    }
    return success(res, { data: user });
  } catch (err) {
    return sendError(res, err);
  }
};

/**
 * PUT /api/auth/change-password
 * Any logged-in user (admin or member) changes their own password.
 * Requires the current password to confirm it's really them.
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return error(res, { message: 'User not found', status: 404 });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return error(res, { message: 'Current password is incorrect', status: 401 });
    }

    const hashed = await hashPassword(newPassword);
    await user.update({ password: hashed });

    return success(res, { message: 'Password updated successfully' });
  } catch (err) {
    return sendError(res, err);
  }
};

module.exports = { register, login, me, changePassword };
