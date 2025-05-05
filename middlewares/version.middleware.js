import authenticateJWT from './auth.middleware.js';
import express from 'express';
const { RequestHandler } = express;
/**
 * Middleware to auto-protect routes for a specific version.
 *
 * @param {string} version  - The API version (e.g., 'v1', 'v2')
 * @type {RequestHandler}
 */
export function protectVersionRoutes(version) {
  return (req, res, next) => {
    // If it's version 1 (or higher), auto-apply JWT protection
    if (version === 'v1') {
      const publicRoutes = [
        '/auth/login',
        '/auth/refresh-token',
        '/auth/register',
        '/auth/logout',
        '/user/public-info',
      ]; // public routes in v1

      // Check if the current path matches any public route
      const isPublicRoute = publicRoutes.some((route) => req.path.endsWith(route));

      if (isPublicRoute) {
        return next(); // Skip authentication for public routes
      }

      authenticateJWT(req, res, next); // Protect other routes
    } else {
      next(); // No auth for other versions (you can change this if needed)
    }
  };
}
