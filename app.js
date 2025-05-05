import express from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';
import helmet from 'helmet';
import setupHelmet from './config/helmet.config.js';
import { setupDynamicRoutes } from './core/routesLoader.js';
import { protectVersionRoutes } from './middlewares/version.middleware.js';
import { errorHandlerMiddleware } from './middlewares/errorHandler.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config.js';
import logger, { morganMiddleware } from './utilities/logger.util.js';
import { csrfProtection } from './middlewares/csrf.middleware.js';
import { corsPolicy } from './middlewares/cors.middleware.js';

const app = express();
if (process.env.NODE_ENV === 'production') {
  setupHelmet(app);
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

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
app.use(morganMiddleware);

/**
 * Middleware to parse cookies.
 * @function
 */
app.use(cookieParser());

/**
 * Global CSRF protection for all non-GET routes
 * Skips routes that don't need CSRF protection
 */
app.use(csrfProtection())

/**
 * Custom CORS middleware to handle origin properly with credentials
 */
app.use(corsPolicy());

/**
 * Protects routes for version 2 using JWT authentication.
 * @function
 * @param {string} version - The version string to apply protection to (e.g., 'v2').
 */
app.use('/api/v1', protectVersionRoutes('v1')); // Protect routes in /api/v2

/**
 * Sets up dynamic versioned routes and watches for changes in controller files.
 * @function
 * @param {express.Application} app - The Express app to mount routes to.
 */
setupDynamicRoutes(app);


/**
 * Serves the Swagger UI documentation and enables the "Authorize" feature for JWT.
 * @function
 * @param {swaggerUi.SwaggerUiOptions} swaggerSpec - The Swagger specification.
 */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      withCredentials: true, // Enable sending cookies with Swagger requests
      persistAuthorization: true,
    },
  })
);

/**
 * Global error handler middleware for catching and logging errors.
 * @function
 * @param {Error} err - The error object.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @param {express.NextFunction} next - The callback function to pass control to the next middleware.
 */
app.use(errorHandlerMiddleware);

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
    { Name: '🚀 Server running at', URL: appUrl },
    { Name: '📚 API Docs available at', URL: `${appUrl}/api-docs` },
  ]);
});
