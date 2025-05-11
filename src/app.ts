import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';
import helmet from 'helmet';
import { setupDynamicRoutes } from '@/core/routesLoader.js';
import { protectVersionRoutes } from '@/middlewares/version.middleware.js';
import { errorHandlerMiddleware } from '@/middlewares/errorHandler.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@/config/swagger.config.js';
import { morganMiddleware } from '@/utilities/logger.util.js';
import { csrfProtection } from '@/middlewares/csrf.middleware.js';
import { corsPolicy } from '@/middlewares/cors.middleware.js';
import setupHelmet from '@/config/helmet.config.js';
import dotenv from 'dotenv';
dotenv.config();
const app: Application = express();

// Helmet setup
if (process.env.NODE_ENV === 'production') {
  setupHelmet(app);
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP request logging
app.use(morganMiddleware);

// Cookie parser
app.use(cookieParser());

// CSRF protection
app.use(csrfProtection());

// CORS handling
app.use(corsPolicy());

// Protect versioned routes
app.use('/api/v1', protectVersionRoutes('v1'));

// Dynamic routes loader
setupDynamicRoutes(app);

// Swagger docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      withCredentials: true,
       persistAuthorization: true,
    },
  })
);

// Error handler
app.use(errorHandlerMiddleware);

// Create server
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

// Start listening
server.listen(PORT, () => {
  const appUrl = `${protocol}://${process.env.URL || 'localhost'}:${PORT}`;
  console.clear();

  console.table([
    { Name: '🚀 Server running at', URL: appUrl },
    { Name: '📚 API Docs available at', URL: `${appUrl}/api-docs` },
  ]);
});
