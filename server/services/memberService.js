const crypto = require('crypto');
const { sequelize, User, Member } = require('../models');
const { hashPassword } = require('./authService');

/**
 * Creates a Member together with its linked User login account, in a
 * single transaction — either both are created or neither is.
 * A random default password is generated; the admin shares it with the
 * member out-of-band (or the member resets it later, once that flow exists).
 */
const createMemberWithAccount = async (memberData) => {
  const { name, email, phone, address, join_date, monthly_fee, status, password } = memberData;

  return sequelize.transaction(async (t) => {
    const existingUser = await User.findOne({ where: { email }, transaction: t });
    if (existingUser) {
      const err = new Error('An account with this email already exists');
      err.status = 409;
      throw err;
    }

    const hashed = await hashPassword(password || 'Member@123');

    const user = await User.create(
      { name, email, password: hashed, role: 'member' },
      { transaction: t }
    );

    const member = await Member.create(
      {
        user_id: user.id,
        name,
        email,
        phone,
        address,
        join_date,
        monthly_fee,
        status: status || 'active',
      },
      { transaction: t }
    );

    return member;
  });
};

module.exports = { createMemberWithAccount, resetMemberPassword };

/**
 * Admin-triggered password reset. Generates a short, readable random
 * password, hashes it for storage, and returns the plaintext ONCE so the
 * admin can relay it to the member — it is never stored or logged in
 * plaintext anywhere.
 */
async function resetMemberPassword(memberId) {
  const member = await Member.findByPk(memberId);
  if (!member) {
    const err = new Error('Member not found');
    err.status = 404;
    throw err;
  }

  const user = await User.findByPk(member.user_id);
  if (!user) {
    const err = new Error('No login account linked to this member');
    err.status = 404;
    throw err;
  }

  // e.g. "K3F9-QX7M" — readable enough to relay verbally or by text, random
  // enough not to guess.
  const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase().replace(/(.{4})(.{4})/, '$1-$2');

  const hashed = await hashPassword(tempPassword);
  await user.update({ password: hashed });

  return { tempPassword, memberName: member.name, email: user.email };
}
