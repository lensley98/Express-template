import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import path, { dirname } from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
/**
 * Swagger setup and configuration options.
 */
const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Template API',
      version: '1.0.0',
      description: 'API documentation automatically generated.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: 'Development server (v1)',
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v2`,
        description: 'Development server (v2)',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  },
  // ...
  apis: [
    path.resolve(__dirname, '../controllers/**/*.controller.ts'),
    path.resolve(__dirname, '../validators/**/*.ts'),
    path.resolve(__dirname, '../middlewares/**/*.ts'),
  ],
};

import { fileURLToPath } from 'url';

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
