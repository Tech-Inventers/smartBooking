// utils/jwtUtils.js

const jwt = require("jsonwebtoken");

/**
 * Generates a JSON Web Token (JWT) for a given payload.
 * The token expires in 1 hour.
 * @param {object} payload - The data to include in the token.
 * @returns {string} The generated JWT.
 */
exports.generateToken = (payload) => {
  // Ensure JWT_SECRET is available in environment variables
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables.");
    // In a real application, you might throw an error or handle this more gracefully.
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * Verifies a given JSON Web Token (JWT).
 * @param {string} token - The JWT to verify.
 * @returns {object} The decoded payload if verification is successful.
 * @throws {Error} If the token is invalid or expired.
 */
exports.verifyToken = (token) => {
  // Ensure JWT_SECRET is available in environment variables
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables.");
    // In a real application, you might throw an error or handle this more gracefully.
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};