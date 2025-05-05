import { verifyToken } from '../utilities/token.util.js';
import logger from '../utilities/logger.util.js';

/**
 * Middleware to protect routes using JWT authentication.
 * Now prioritizes Authorization header over cookies for the main token.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function in the chain.
 */
const authenticateJWT = (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    // Prioritize Authorization header (Bearer token)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    // Verify the token
    req.user = verifyToken(token);

    next();
  } catch (err) {
    logger.error('JWT Authentication Error:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid or malformed token',
    });
  }
};

export default authenticateJWT;
