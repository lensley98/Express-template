/**
 * @module errorHandler
 * @description Express middleware for centralized error handling.
 *
 * @param {Error} err - The error object thrown in the app
 * @param {import('express').Request} req - The incoming request object
 * @param {import('express').Response} res - The outgoing response object
 * @param {import('express').NextFunction} next - The next middleware function
 */
export function errorHandlerMiddleware(err, req, res, next) {
    console.error(err.stack); // Log error stack trace (could be replaced with Winston)

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
