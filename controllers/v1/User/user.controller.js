import express from 'express';
import  authenticateJWT from '../../../middlewares/auth.middleware.js';
import {AppError} from "../../../utilities/appError.util.js";

const router = express.Router();

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
 *       401:
 *         description: Unauthorized
 */
router.get('/list', authenticateJWT, (req, res) => {
    res.json({ message: 'List of all users', user: req.user });
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
 */
// Public route (no auth)
router.get('/public-info', (req, res) => {
    res.json({ message: 'This is public information' });
});

/**
 * @swagger
 * /user/simulate-error-no-user:
 *   get:
 *     summary: Simulate error handling
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Simulate error handling
 *       404:
 *          description: User not found
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
})


export default router;