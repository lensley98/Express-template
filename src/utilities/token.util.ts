import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { Payload } from '@/models/payload.interface.js';
import dotenv from 'dotenv';
dotenv.config();

// Utility: Create JWT Token
/**
 * Generates a JWT token.
 *
 * @param {Payload} payload - The payload to encode into the token.
 * @returns {string} The signed JWT token.
 */
const generateToken = (payload: Payload): string => {
  if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY environment variable is not defined');
  }
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
};

// Utility: Verify JWT Token
/**
 * Verifies a JWT token and returns the decoded payload.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {Payload} The decoded payload.
 */
const verifyToken = (token: string): Payload => {
  if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY environment variable is not defined');
  }
  return jwt.verify(token, process.env.SECRET_KEY) as Payload;
};

/**
 * Generate a long-lived refresh token
 */
const generateRefreshToken = (user: { id: string }): string => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET environment variable is not defined');
  }
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
const verifyRefreshToken = (token: string): { id: string; type: string } => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET environment variable is not defined');
  }
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as { id: string; type: string };
};

/**
 * Middleware to validate CSRF token
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the chain.
 */
const validateCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests (they should be idempotent)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next(); // Proceed to the next middleware
  }

  const csrfToken = req.headers['x-csrf-token'] as string | undefined;
  const storedCsrfToken = req.cookies?.csrfToken as string | undefined;

  if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
    res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
    }); // Send the response and terminate here
    return; // No need to call `next()`, as response is already sent
  }

  next(); // Proceed to the next middleware if CSRF token is valid
};

/**
 * Generate a random CSRF token
 * @returns {string} Random token
 */
const generateCsrfToken = (): string => {
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
