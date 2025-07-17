// utils/hashUtils.js

const bcrypt = require("bcryptjs");

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} password - The plain-text password to hash.
 * @returns {Promise<string>} The hashed password.
 */
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compares a plain-text password with a hashed password.
 * @param {string} password - The plain-text password.
 * @param {string} hash - The hashed password to compare against.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
exports.comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};