import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { v4 as guid } from 'uuid';
import logger from '@/utilities/logger.util.js';
import { User } from '@/models/user/user.interface.js';
import {
  validateUsername,
  validateEmail,
  handleValidationErrors,
} from '@/validators/user.validator.js';
import { UserResponse } from '@/models/user/user.response.interface.js';

const router: express.Router = express.Router();
/**
 * users controller
 * Handles users retrieval, creation, update, and deletion
 */
class UsersController {
  /**
   * Get all users (admin only)
   * @param {Request} _req - Express request object with potential users information
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   */
  public static getAllUsers: RequestHandler = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // TODO: Implement authentication and authorization check for admin role
      // if (!req.users || !req.users.isAdmin) {
      //   return res.status(403).json({ success: false, message: 'Unauthorized' } as ApiResponse);
      // }

      // TODO: Replace with actual database query to fetch all users
      const users: User[] = [
        {
          id: guid(),
          username: 'user1',
          email: 'user1@example.com',
          createdAt: new Date(),
          isAdmin: true,
        },
        {
          id: guid(),
          username: 'user2',
          email: 'user2@example.com',
          createdAt: new Date(),
          isAdmin: false,
        },
      ];

      res.status(200).json({ success: true, message: 'Get successful', users } as UserResponse);
    } catch (error) {
      logger.error('Error fetching all users:', error);
      next(error);
    }
  };

  /**
   * Get a users by ID
   * @param req - Express request object with users ID parameter
   * @param res - Express response object
   * @param next - Express next function
   */
  public static getUserById: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      // TODO: Implement authentication and authorization check
      // For non-admin users, they should only be able to access their own data
      // if (!req.users || (req.users.id !== id && !req.users.isAdmin)) {
      //   return res.status(403).json({ success: false, message: 'Unauthorized' } as UserResponse);
      // }

      // TODO: Replace with actual database query to fetch users by ID
      const user: User | undefined = {
        id,
        username: `user-${id}`,
        email: `user-${id}@example.com`,
        createdAt: new Date(),
        isAdmin: false,
      };

      if (!user) {
        res.status(404).json({ success: false, message: 'users not found' } as UserResponse);
        return;
      }

      res.status(200).json({ success: true, user } as UserResponse);
    } catch (error) {
      logger.error(`Error fetching user with ID ${req.params.id}:`, error);
      next(error);
    }
  };

  /**
   * Create a new users (admin only)
   * @param req - Express request object with users data in the body
   * @param res - Express response object
   * @param next - Express next function
   */
  public static createUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // TODO: Implement authentication and authorization check for admin role
      // if (!req.users || !req.users.isAdmin) {
      //   return res.status(403).json({ success: false, message: 'Unauthorized' } as UserResponse);
      // }

      const { username, email } = req.body as User; // Adjust type as needed

      // TODO: Add users creation logic in the database
      const newUser: User = {
        id: guid(),
        username,
        email,
        createdAt: new Date(),
        isAdmin: false,
      };

      res.status(201).json({
        success: true,
        message: 'users created successfully',
        user: newUser,
      } as UserResponse);
    } catch (error) {
      logger.error('Error creating users:', error);
      next(error);
    }
  };

  /**
   * Update an existing users by ID
   * @param req - Express request object with users ID parameter and updated data in the body
   * @param res - Express response object
   * @param next - Express next function
   */
  public static updateUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { username, email } = req.body as Partial<User>; // Allow partial updates

      // TODO: Implement authentication and authorization check
      // For non-admin users, they should only be able to update their own data
      // if (!req.users || (req.users.id !== id && !req.users.isAdmin)) {
      //   return res.status(403).json({ success: false, message: 'Unauthorized' } as UserResponse);
      // }

      // TODO: Replace with actual database update logic
      // Check if users exists
      const existingUser: User | undefined = {
        id,
        username: `user-${id}`,
        email: `user-${id}@example.com`,
        createdAt: new Date(),
        isAdmin: false,
      };

      if (!existingUser) {
        res.status(404).json({ success: false, message: 'users not found' } as UserResponse);
        return;
      }

      const updatedUser: User = {
        ...existingUser,
        username: username ?? existingUser.username,
        email: email ?? existingUser.email,
      };

      res.status(200).json({
        success: true,
        message: 'users updated successfully',
        user: updatedUser,
      } as UserResponse);
    } catch (error) {
      logger.error(`Error updating user with ID ${req.params.id}:`, error);
      next(error);
    }
  };

  /**
   * Delete a users by ID (admin only)
   * @param req - Express request object with users ID parameter
   * @param res - Express response object
   * @param next - Express next function
   */
  public static deleteUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      // TODO: Implement authentication and authorization check for admin role
      // if (!req.users || !req.users.isAdmin) {
      //   return res.status(403).json({ success: false, message: 'Unauthorized' } as UserResponse);
      // }

      // TODO: Replace with actual database deletion logic
      const existingUser: User | undefined = {
        id,
        username: `user-${id}`,
        email: `user-${id}@example.com`,
        createdAt: new Date(),
        isAdmin: false,
      };

      if (!existingUser) {
        res.status(404).json({ success: false, message: 'users not found' } as UserResponse);
        return;
      }

      res.status(200).json({ success: true, message: 'users deleted successfully' } as UserResponse);
    } catch (error) {
      logger.error(`Error deleting user with ID ${req.params.id}:`, error);
      next(error);
    }
  };
}

// Define middleware type
type ValidationMiddleware = (req: Request, res: Response, next: NextFunction) => void;

/**
 * users validator middleware - checks if auth is well-structured
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *     UserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
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
 *                   example: "Get successful"
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/users'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden (admin access required)
 */

router.get('/', UsersController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get users by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: users data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden (access to own data or admin access required)
 *       404:
 *         description: users not found
 */

router.get('/:id', UsersController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new users (admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: users created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden (admin access required)
 */

router.post(
  '/',
  [
    validateUsername as ValidationMiddleware,
    validateEmail as ValidationMiddleware,
    handleValidationErrors as ValidationMiddleware,
  ],
  UsersController.createUser
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a users by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: users updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden (access to own data or admin access required)
 *       404:
 *         description: users not found
 */

router.put(
  '/:id',
  [
    validateUsername as ValidationMiddleware,
    validateEmail as ValidationMiddleware,
    handleValidationErrors as ValidationMiddleware,
  ],
  UsersController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a users by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: users deleted successfully
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
 *                   example: "users deleted successfully"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden (admin access required)
 *       404:
 *         description: users not found
 */

router.delete('/:id', UsersController.deleteUser);

export default router;
