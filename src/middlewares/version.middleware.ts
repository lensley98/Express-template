import { Request, Response, NextFunction, RequestHandler } from 'express';
import authenticateJWT from './auth.middleware.js';

/**
 * Middleware to auto-protect routes for a specific version.
 *
 * @param version - The API version (e.g., 'v1', 'v2')
 * @returns Express middleware function
 */
export function protectVersionRoutes(version: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (version === 'v1') {
      const publicRoutes: string[] = [
        '/auth/login',
        '/auth/refresh-token',
        '/auth/register',
        '/auth/logout',
      ];

      const isPublicRoute = publicRoutes.some((route) => req.path.endsWith(route));

      if (isPublicRoute) {
        return next();
      }

      authenticateJWT(req, res, next); // Apply JWT protection
    } else {
      next(); // Allow access for other versions (change this if needed)
    }
  };
}
