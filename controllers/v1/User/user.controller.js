import express from 'express';
import  authenticateJWT from '../../../core/auth.middleware.js';

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
 *         description: user info
 */
// Public route (no auth)
router.get('/public-info', (req, res) => {
    res.json({ message: 'This is public information' });
});


export default router;