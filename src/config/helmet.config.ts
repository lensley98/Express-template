import helmet from 'helmet';
import { Application } from 'express';

/**
 * Configures security-related HTTP headers using Helmet middleware.
 *
 * @param app - The Express application instance
 */
const setupHelmet = (app: Application): void => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          scriptSrc: ["'self'", 'https:', "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://localhost:*'],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'no-referrer' },
    })
  );

  // Apply these separately (as they're no longer part of the main helmet config)
  app.use(helmet.hidePoweredBy());
  app.use(helmet.xssFilter());
};

export default setupHelmet;
