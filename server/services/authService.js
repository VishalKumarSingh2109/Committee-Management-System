const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const SALT_ROUNDS = 10;

const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

const generateToken = (user) => {
  // Keep the payload minimal — id + role is all downstream middleware needs.
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret); // throws if invalid/expired
};

module.exports = { hashPassword, comparePassword, generateToken, verifyToken };
