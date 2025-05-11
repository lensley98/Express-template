import { Request, Response, Router, NextFunction, RequestHandler } from 'express';
import {
  validateUsername,
  validatePassword,
  validateEmail,
  handleValidationErrors,
} from '@/validators/user.validator.js';
import {
  generateCsrfToken,
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from '@/utilities/token.util.js';
import { v4 as guid } from 'uuid';
import logger from '@/utilities/logger.util.js';
import { User } from '@/models/user/user.interface.js';
import { AuthResponse } from '@/models/auth/auth.response.interface.js';
import { Payload } from '@/models/payload.interface.js';
import { Register } from '@/models/user/register.interface.js';
import { Login } from '@/models/auth/login.interface.js';
import dotenv from 'dotenv';
dotenv.config();
const router = Router();

/**
 * users authentication controller
 * Handles users registration, login, token refresh, and logout
 */
class AuthController {
  /**
   * Cookie options
   */
  private static readonly COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Set authentication cookies
   * @param res - Express response object
   * @param refreshToken - JWT refresh token
   * @param csrfToken - CSRF token
   */
  private static setCookies(res: Response, refreshToken: string, csrfToken: string): void {
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: AuthController.COOKIE_MAX_AGE,
      path: '/',
    });

    // Set CSRF token in a JavaScript-accessible cookie
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: AuthController.COOKIE_MAX_AGE,
      path: '/',
    });
  }

  /**
   * Clear authentication cookies
   * @param res - Express response object
   */
  private static clearCookies(res: Response): void {
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
  }

  /**
   * Register a new users
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  public static register: RequestHandler = async (req, res, next) => {
    try {
      const { username, email } = req.body as Register;

      // TODO: Add users creation logic with password hashing
      // const hashedPassword = await bcrypt.hash(password, 10);
      // const newUser = await UserModel.create({ username, email, password: hashedPassword });

      // For demo purposes
      const user: User = {
        id: guid(),
        username,
        email,
        createdAt: new Date(),
        isAdmin: false,
      };

      res.status(201).json({
        success: true,
        message: 'users registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      } as AuthResponse);
    } catch (error) {
      logger.error('users registration error:', error);
      next(error);
    }
  };

  /**
   * Authenticate users and return tokens
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  public static login: RequestHandler = async (req, res, next) => {
    try {
      const { username } = req.body as Login;

      // TODO: Replace with real database lookup and password verification
      // const users = await UserModel.findOne({ username });
      // if (!users || !await bcrypt.compare(password, users.password)) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'Invalid username or password',
      //   });
      // }

      // For demo purposes
      const user: User = {
        id: guid(),
        username,
        isAdmin: false,
      };

      // Generate tokens
      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      const csrfToken = generateCsrfToken();

      // Set cookies
      AuthController.setCookies(res, refreshToken, csrfToken);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken,
        user,
      } as AuthResponse);
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  };

  /**
   * Refresh access token using refresh token
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  public static refreshToken: RequestHandler = (req, res, next) => {
    try {
      // Extract refresh token from cookie
      const refreshToken = req.cookies.refreshToken as string | undefined;
      const csrfTokenFromHeader = req.headers['x-csrf-token'] as string | undefined;

      // Validate presence of tokens
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'No refresh token provided',
        } as AuthResponse);
        return;
      }

      if (!csrfTokenFromHeader) {
        res.status(403).json({
          success: false,
          message: 'CSRF token missing',
        } as AuthResponse);
        return;
      }

      // TODO: Validate CSRF token against stored value
      // if (csrfTokenFromHeader !== storedCsrfToken) {
      //   res.status(403).json({
      //     success: false,
      //     message: 'CSRF validation failed',
      //   });
      //   return;
      // }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken) as Payload;

      // Check if it's actually a refresh token
      if (!decoded.type || decoded.type !== 'refresh') {
        res.status(403).json({
          success: false,
          message: 'Invalid token type',
        } as AuthResponse);
        return;
      }

      // Create a users object from decoded refresh token
      const user: User = {
        id: decoded.id,
        username: decoded.username,
        isAdmin: false,
      };

      // Generate new tokens
      const accessToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);
      const newCsrfToken = generateCsrfToken();

      // Update cookies with new tokens
      AuthController.setCookies(res, newRefreshToken, newCsrfToken);

      res.status(200).json({
        success: true,
        accessToken,
      } as AuthResponse);
    } catch (error: any) {
      logger.error('Token refresh error:', error);

      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Refresh token expired, please login again',
        } as AuthResponse);
        return;
      }

      next(error);
    }
  };

  /**
   * Logout users and clear tokens
   * @param req - Express request object
   * @param res - Express response object
   */
  public static logout: RequestHandler = (req, res) => {
    // Validate CSRF token
    const csrfTokenFromHeader = req.headers['x-csrf-token'] as string | undefined;
    const csrfTokenFromCookie = req.cookies.csrfToken as string | undefined;

    if (!csrfTokenFromHeader || csrfTokenFromHeader !== csrfTokenFromCookie) {
      res.status(403).json({
        success: false,
        message: 'CSRF validation failed',
      } as AuthResponse);
      return;
    }

    // Clear cookies
    AuthController.clearCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    } as AuthResponse);
  };
}

// Define middleware types
type ValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => void;

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new users
 *     tags: [Authentication]
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
 *         description: users created successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: CSRF validation failed
 */
router.post(
  '/register',
  [
    validateUsername as ValidatorMiddleware,
    validateEmail as ValidatorMiddleware,
    validatePassword as ValidatorMiddleware,
    handleValidationErrors as ValidatorMiddleware,
  ],
  AuthController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate users and return tokens
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
 *                 users:
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
  [
    validateUsername as ValidatorMiddleware,
    validatePassword as ValidatorMiddleware,
    handleValidationErrors as ValidatorMiddleware,
  ],
  AuthController.login
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
router.post('/refresh-token', AuthController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout users and clear tokens
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
 *       403:
 *         description: CSRF token validation failed
 */
router.post('/logout', AuthController.logout);

export default router;
