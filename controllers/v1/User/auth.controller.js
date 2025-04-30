import express from 'express';
import { validateUsername, validatePassword } from '../../../validators/user.validator.js';
import { generateToken, verifyToken } from '../../../utilities/token.util.js';
import { v4 as uuidv4 } from 'uuid';
import  authenticateJWT  from '../../../core/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     description: Authenticates a user and sets a JWT token in a cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid username or password
 */
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        if (!validateUsername(username)) {
            return res.status(400).json({ message: 'Invalid username. Only alphanumeric characters are allowed.' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Invalid password. Must contain at least 1 uppercase letter, 1 number, 1 special character, and be at least 7 characters long.' });
        }

        // TODO: Replace with real database lookup for username + password
        const id = uuidv4();
        const token = generateToken({ id, username });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000, // 1 hour
        });

        return res.status(200).json({ token });

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     description: Returns the logged-in user's profile
 *     responses:
 *       200:
 *         description: Profile information
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateJWT, (req, res, next) => {
    try {


        return res.status(200).json({ message: `Welcome ${req.user.username} with id ${req.user.id}` });

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     description: Clears the JWT auth cookie
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    return res.status(200).json({ message: 'Logged out successfully.' });
});
 export default router;