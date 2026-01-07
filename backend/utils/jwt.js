const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
