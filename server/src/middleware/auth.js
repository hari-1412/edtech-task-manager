const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 *
 * Responsibilities:
 * - Validate that the incoming request includes a Bearer JWT in the
 *   `Authorization` header.
 * - Verify the token signature and expiry using the server secret.
 * - Load the corresponding `User` document and attach it to `req.user` so
 *   downstream handlers can make authorization decisions.
 *
 * Behavior and security notes:
 * - Missing or malformed Authorization header => 401.
 * - Invalid or expired token => 401 with a clear message to the client.
 * - We intentionally load the full user document (without password) so
 *   handlers have access to user fields like `role`, `_id`, and `teacherId`.
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    // Extract token (format: "Bearer TOKEN")
    const token = authHeader.split(' ')[1];

    // Verify token signature and expiration. `jwt.verify` throws if token
    // is invalid or expired which we catch below and return 401.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded is expected to contain identifying info (e.g. userId).
    // Load the user from DB so we can attach role and other metadata to
    // `req.user`. Note: password is not selected by default in the model
    // (ensure your User model excludes it) — we only need identity + role.
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }

    // Attach user to request object for use in routes
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = authenticate;