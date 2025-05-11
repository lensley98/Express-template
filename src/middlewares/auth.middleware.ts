import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utilities/token.util.js';
import logger from '../utilities/logger.util.js';

/**
 * Middleware to protect routes using JWT authentication.
 * Prioritizes Authorization header over cookies for the main token.
 */
const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;
    const authHeader = req.headers['authorization'];

    // Check for Bearer token in Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
      return;
    }

    // Verify the token and assign decoded auth to req.auth
    // Add non-null assertion since we've checked token exists above
    req.user = verifyToken(token!);
    next();
  } catch (err: any) {
    logger.error('JWT Authentication Error:', err);

    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Invalid or malformed token',
    });
  }
};

export default authenticateJWT;
