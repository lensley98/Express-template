import jwt from 'jsonwebtoken';
import express from 'express';
const { RequestHandler } = express;

const secretKey = process.env.SECRET_KEY;

/**
 * Middleware to protect routes using JWT authentication.
 *
 * @type {RequestHandler}
 */
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.cookies.authToken; // Allow token from Cookie too!

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    let token;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        token = authHeader;
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('JWT Error:', err);
            return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
        }
        req.user = decoded; // Attach user info to request
        next();
    });
};

export default authenticateJWT;
