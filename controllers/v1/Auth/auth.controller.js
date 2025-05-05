import express from 'express';
import {
  validateUsername,
  validatePassword,
  handleValidationErrors,
} from '../../../validators/user.validator.js';
import {
  generateCsrfToken,
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from '../../../utilities/token.util.js';
import { v4 as guid } from 'uuid';
import logger from '../../../utilities/logger.util.js';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and return tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "John123"
 *               password:
 *                 type: string
 *                 example: "Password1234?"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [validateUsername, validatePassword, handleValidationErrors],
  async (req, res, next) => {
    try {
      const { username } = req.body;

      // TODO: Replace with real database lookup for username + password

      // For demo purposes, creating a mock user
      const user = {
        id: guid(),
        username: username,
      };

      // Generate tokens
      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      const csrfToken = generateCsrfToken();

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Prevents JavaScript access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
        path: '/', // Cookie available across the site
      });

      // Set CSRF token in a JavaScript-accessible cookie
      res.cookie('csrfToken', csrfToken, {
        httpOnly: false, // JavaScript needs access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
        path: '/',
      });

      // Return access token in response body (to be stored in memory)
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken, // Send JWT in response body for storage in localStorage/memory
        csrfToken, // Send CSRF token in response for frontend storage
        user,
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: true
 *         description: CSRF token for validation
 *     responses:
 *       200:
 *         description: Token refresh successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 *       403:
 *         description: CSRF validation failed
 */
router.post('/refresh-token', (req, res, next) => {
  try {
    // Extract refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if it's actually a refresh token
    if (!decoded.tokenType || decoded.tokenType !== 'refresh') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    // Create a user object from decoded refresh token
    const user = {
      id: decoded.id,
      username: decoded.username,
    };

    // Generate new tokens
    const accessToken = generateToken(user);
    const csrfToken = generateCsrfToken();

    // Update CSRF token cookie
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Return new access token
    return res.status(200).json({
      success: true,
      accessToken,
      csrfToken,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired, please login again',
      });
    }

    next(error);
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and clear tokens
 *     tags: [Authentication]
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: true
 *         description: CSRF token for validation
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  // Clear CSRF token cookie
  res.clearCookie('csrfToken', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

export default router;
