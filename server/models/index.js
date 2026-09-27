const { sequelize } = require('../config/db');
const User = require('./User');
const Member = require('./Member');
const Payment = require('./Payment');

// User (1) ── (1) Member
User.hasOne(Member, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Member.belongsTo(User, { foreignKey: 'user_id' });

// Member (1) ── (many) Payment
Member.hasMany(Payment, { foreignKey: 'member_id', onDelete: 'CASCADE' });
Payment.belongsTo(Member, { foreignKey: 'member_id' });

// User (admin, 1) ── (many) Payment  [verified_by]
User.hasMany(Payment, { foreignKey: 'verified_by', as: 'verifiedPayments' });
Payment.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

module.exports = {
  sequelize,
  User,
  Member,
  Payment,
};
