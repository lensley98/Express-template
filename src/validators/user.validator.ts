import { AppError } from '@/utilities/appError.util.js';
import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, NextFunction, Response } from 'express';

/**
 * users validator middleware - checks if auth is well-structured
 * @swagger
 * components:
 *   schemas:
 *     users:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Alphanumeric username
 *           pattern: ^[a-zA-Z0-9]+$
 *           example: "john123"
 *         email:
 *           type: string
 *           description: Valid email address
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           description: Password with at least 1 uppercase, 1 number, 1 special character, min 7 characters
 *           pattern: ^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$
 *           example: "Secret$123"
 */
export const validateUsername: ValidationChain = body('username')
  .isAlphanumeric()
  .withMessage('Username must contain only letters and numbers');

/**
 * Password validator middleware - checks password strength
 */
export const validatePassword: ValidationChain = body('password')
  .isLength({ min: 7 })
  .withMessage('Password must be at least 7 characters long')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/\d/)
  .withMessage('Password must contain at least one number')
  .matches(/[\W_]/)
  .withMessage('Password must contain at least one special character');

/**
 * Email validator middleware
 */
export const validateEmail: ValidationChain = body('email')
  .isEmail()
  .withMessage('Please provide a valid email address');

/**
 * Validation error handler middleware that sends a proper JSON response for validation failures
 * @param {Request} req - The incoming request object
 * @param {Response} _res - The outgoing response object
 * @param {NextFunction} next - The next middleware function
 */
export const handleValidationErrors = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Create validation error messages
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(', ');

    // Pass the error to the next middleware (error handler)
    return next(new AppError(errorMessages, 400)); // 400 Bad Request for validation errors
  }
  next();
};
