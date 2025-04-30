import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { setupDynamicRoutes } from './core/routesLoader.js';
import { protectVersionRoutes } from './core/versionMiddleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import http from 'http';

const app = express();

/**
 * Middleware to parse JSON bodies.
 * @function
 */
app.use(express.json());

/**
 * Middleware to parse URL-encoded bodies.
 * @function
 */
app.use(express.urlencoded({ extended: false }));

/**
 * Middleware to log HTTP requests.
 * @function
 */
app.use(logger('dev'));

/**
 * Middleware to parse cookies.
 * @function
 */
app.use(cookieParser());

/**
 * CORS middleware to allow cross-origin requests with proper headers for Swagger UI and API requests.
 * @function
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @param {express.NextFunction} next - The callback function to pass control to the next middleware.
 */
app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin);

    // Allow credentials (important for cookie-based auth)
    res.header('Access-Control-Allow-Credentials', 'true');

    // Allow necessary headers (especially for Swagger UI)
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Allow common methods
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

/**
 * Sets up dynamic versioned routes and watches for changes in controller files.
 * @function
 * @param {express.Application} app - The Express app to mount routes to.
 */
setupDynamicRoutes(app);

/**
 * Protects routes for version 2 using JWT authentication.
 * @function
 * @param {string} version - The version string to apply protection to (e.g., 'v2').
 */
app.use('/api/v2', protectVersionRoutes('v2'));  // Protect routes in /api/v2

/**
 * Serves the Swagger UI documentation and enables the "Authorize" feature for JWT.
 * @function
 * @param {swaggerUi.SwaggerUiOptions} swaggerSpec - The Swagger specification.
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        authAction: {
            BearerAuth: {
                name: 'BearerAuth',
                schema: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: `Enter your JWT token as "Bearer <your_token>"`,
                },
                value: 'Bearer <your_token_here>', // Placeholder for the token
            },
        },
    }
}));

/**
 * Global error handler middleware for catching and logging errors.
 * @function
 * @param {Error} err - The error object.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @param {express.NextFunction} next - The callback function to pass control to the next middleware.
 */
app.use((err, req, res) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500,
            time: new Date().toISOString(),
            path: req.originalUrl
        }
    });
});

/**
 * Creates and starts the HTTP server to listen for incoming requests.
 * @function
 */
const server = http.createServer(app);

/**
 * Starts the server on a specified port and logs the server URL.
 * @function
 */
const PORT = process.env.PORT || 3000;
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

server.listen(PORT, () => {
    const appUrl = `${protocol}://${process.env.URL || 'localhost'}:${PORT}`;
    console.clear(); // optional: clears console each restart for clean logs

    console.table([
        { Name: "🚀 Server running at", URL: appUrl },
        { Name: "📚 API Docs available at", URL: `${appUrl}/api-docs` }
    ]);
});
