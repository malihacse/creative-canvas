const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT tokens
 * Adds user object to req.user if token is valid
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get full user object from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = {
  authenticateToken
};
