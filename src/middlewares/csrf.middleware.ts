import { Request, Response, NextFunction } from 'express';
import { validateCsrfToken } from '@/utilities/token.util.js';

/**
 * Creates a middleware function that protects against CSRF attacks.
 * @returns Express middleware function
 */
export const csrfProtection = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip CSRF validation for these endpoints
    const csrfExemptRoutes: string[] = [
      '/api/v1/auth/login', // Initial login doesn't have CSRF token yet
      '/api-docs', // Swagger docs don't need CSRF
    ];

    const isExempt = csrfExemptRoutes.some((route) => req.path.includes(route));

    if (isExempt) {
      return next();
    }

    // Apply CSRF validation to all other routes
    validateCsrfToken(req, res, next);
  };
};
