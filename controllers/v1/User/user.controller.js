import express from 'express';
import { AppError } from '../../../utilities/appError.util.js';
import logger from '../../../utilities/logger.util.js';
import {
  handleValidationErrors,
  validateEmail,
  validateUsername,
} from '../../../validators/user.validator.js';

const router = express.Router();

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     description: Retrieves all users (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "550e8400-e29b-41d4-a716-446655440000"
 *                   username:
 *                     type: string
 *                     example: "john123"
 *                   email:
 *                     type: string
 *                     example: "john@example.com"
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
 *                   example: "Authentication required"
 *       403:
 *         description: Access denied
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
 *                   example: "Access denied. Admin only."
 */
router.get('/', (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      throw new AppError('Access denied. Admin only.', 403);
    }

    // This would typically use a database query
    // Replace with actual implementation using your User model
    const users = []; // await User.find()

    res.status(200).json(users);
  } catch (err) {
    logger.error(`Error getting all users: ${err.message}`);
    next(err);
  }
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     description: Retrieves a user by their ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 username:
 *                   type: string
 *                   example: "john123"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get('/:id', (req, res, next) => {
  try {
    // This would be your database query
    // Replace with actual implementation using your User model
    const user = null; // await User.findById(req.params.id)

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user is requesting their own data or is admin
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      throw new AppError('Access denied', 403);
    }

    res.status(200).json(user);
  } catch (err) {
    logger.error(`Error getting user ${req.params.id}: ${err.message}`);
    next(err);
  }
});

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     description: Updates a user's information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: true
 *         description: CSRF token for validation
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "updated_username"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                       example: "updated_username"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.put('/:id', [validateUsername, validateEmail], (req, res, next) => {
  try {
    // Handle validation errors
    handleValidationErrors(req);

    // Check if user is updating their own data or is admin
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      throw new AppError('Access denied', 403);
    }

    const { username, email } = req.body;

    // Build user object
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // This would be your database query
    // Replace with actual implementation using your User model
    const user = null; // await User.findById(req.params.id)

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update user in database
    // const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
    const updatedUser = { ...user, ...updateData };

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    logger.error(`Error updating user ${req.params.id}: ${err.message}`);
    next(err);
  }
});

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     description: Deletes a user account
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: true
 *         description: CSRF token for validation
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.delete('/:id', (req, res, next) => {
  try {
    // Check if user is deleting their own account or is admin
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      throw new AppError('Access denied', 403);
    }

    // This would be your database query
    // Replace with actual implementation using your User model
    const user = null; // await User.findById(req.params.id)

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete user from database
    // await User.findByIdAndRemove(req.params.id)

    res.status(200).json({
      success: true,
      message: 'User deleted',
    });
  } catch (err) {
    logger.error(`Error deleting user ${req.params.id}: ${err.message}`);
    next(err);
  }
});

export default router;
