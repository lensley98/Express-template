import authenticateJWT from './auth.middleware.js';
import express from 'express';
const { RequestHandler } = express;
/**
 * Middleware to auto-protect routes for a specific version.
 *
 * @param {string} version  - The API version (e.g., 'v1', 'v2')
 * @type {RequestHandler}
 */
function protectVersionRoutes(version) {
    return (req, res, next) => {
        // If it's version 2 (or higher), auto-apply JWT protection
        if (version === 'v2') {
            const publicRoutes = ['/login', '/register']; // public routes in v2

            if (publicRoutes.includes(req.path)) {
                return next(); // Skip authentication for public routes
            }

            authenticateJWT(req, res, next); // Protect other routes
        } else {
            next(); // No auth for other versions (you can change this if needed)
        }
    };
}

export { protectVersionRoutes };
