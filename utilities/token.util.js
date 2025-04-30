
import jwt from 'jsonwebtoken';

/**
 * @typedef {Object} Payload
 * @property {string} id - The user's ID
 * @property {string} username - The user's username
 */

// Utility: Create JWT Token
/**
 * Generates a JWT token.
 *
 * @param {Payload} payload - The payload to encode into the token.
 * @returns {string} The signed JWT token.
 */
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
};

// Utility: Verify JWT Token
/**
 * Verifies a JWT token and returns the decoded payload.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {Payload} The decoded payload.
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.SECRET_KEY);
};


export  { generateToken, verifyToken }