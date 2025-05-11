import { Request, Response, NextFunction } from 'express';
import { getCorsOptions } from '@/utilities/cors.util.js';

/**
 * Creates a middleware function that sets the CORS policy.
 * @returns Express middleware function
 */
export const corsPolicy = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const corsOptions = getCorsOptions();
    const origin = req.headers.origin;

    // Exit early if corsOptions is null or undefined
    if (!corsOptions) {
      return next();
    }

    if (origin && corsOptions.allowedOrigins?.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      if (corsOptions.allowedMethods) {
        res.setHeader('Access-Control-Allow-Methods', corsOptions.allowedMethods.join(', '));
      }

      if (corsOptions.allowedHeaders) {
        res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
      }

      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
    }

    next();
  };
};
