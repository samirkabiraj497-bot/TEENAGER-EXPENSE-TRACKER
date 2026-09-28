const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a JWT token for an authenticated user
 * @param {object} payload - Typically { userId: user.id, email: user.email }
 * @returns {string} Signed JWT
 */
function generateToken(payload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token 
 * @returns {object} Decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = {
  generateToken,
  verifyToken
};
