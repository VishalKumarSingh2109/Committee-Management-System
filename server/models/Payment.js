const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: { min: 1, max: 12 },
    },
    year: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('paid', 'due', 'pending'),
      allowNull: false,
      defaultValue: 'due',
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    verified_by: {
      type: DataTypes.INTEGER,
      allowNull: true, // users.id of the admin who verified the payment
    },
  },
  {
    tableName: 'payments',
    indexes: [
      { unique: true, fields: ['member_id', 'month', 'year'], name: 'uniq_member_month_year' },
      { fields: ['status'] },
      { fields: ['month', 'year'] },
      { fields: ['transaction_id'] },
    ],
  }
);

module.exports = Payment;
