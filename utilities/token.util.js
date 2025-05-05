import jwt from 'jsonwebtoken';
import crypto from 'crypto';
/**
 * @typedef {Object} Payload
 * @property {string} id - The user's ID
 * @property {string} username - The user's username
 */

// Utility: Create JWT Token
/**
 * Generates a JWT token.
 *
 * @param {Payload} payload - The payload to encode into the token.
 * @returns {string} The signed JWT token.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
};

// Utility: Verify JWT Token
/**
 * Verifies a JWT token and returns the decoded payload.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {Payload} The decoded payload.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.SECRET_KEY);
};

/**
 * Generate a long-lived refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      type: 'refresh',
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

/**
 * Middleware to validate CSRF token
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function in the chain.
 */
const validateCsrfToken = (req, res, next) => {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests (they should be idempotent)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'];
  const storedCsrfToken = req.cookies.csrfToken;

  if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
    });
  }

  next();
};

/**
 * Generate a random CSRF token
 * @returns {string} Random token
 */
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  validateCsrfToken,
  generateCsrfToken,
};
