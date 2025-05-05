import express from 'express';
import { v4 as guid } from 'uuid';
import { AppError } from '../../../utilities/appError.util.js';
import logger from '../../../utilities/logger.util.js';
import {
  handleValidationErrors,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../../../validators/user.validator.js';

const router = express.Router();

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     description: Retrieves the profile of the currently authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     username:
 *                       type: string
 *                       example: "john123"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Authentication required. No token provided."
 */
router.get('/profile', (req, res) => {
  // req.user contains the decoded JWT payload from the authenticateJWT middleware
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
    },
  });
});

/**
 * @swagger
 * /user/list:
 *   get:
 *     summary: Retrieve a list of users (protected)
 *     security:
 *       - BearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List of all users."
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       username:
 *                         type: string
 *                         example: "john123"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Authentication required. No token provided."
 */
router.get('/list', (req, res) => {
  res.json({ message: 'List of all users', users: [req.user] });
});

/**
 * @swagger
 * /user/public-info:
 *   get:
 *     summary: User public info
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This is public information."
 */
// Public route (no auth)
router.get('/public-info', (req, res) => {
  res.json({ message: 'This is public information' });
});

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: true
 *         description: CSRF token for validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: CSRF validation failed
 */
router.post(
  '/register',
  [validateUsername, validatePassword, validateEmail, handleValidationErrors],
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // TODO: Add validation and actual user creation logic

      // For demo purposes
      const user = {
        id: guid(),
        username,
        email,
        createdAt: new Date(),
      };

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      logger.error('User registration error:', error);
      next(error);
    }
  }
);

/**
 * @swagger
 * /user/simulate-error-no-user:
 *   get:
 *     summary: Simulate error handling
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response with user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     username:
 *                       type: string
 *                       example: "john123"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found."
 */
router.get('/simulate-error-no-user', (req, res, next) => {
  try {
    const user = null; // simulate no user

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err); // Pass to the centralized error handler
  }
});

export default router;
