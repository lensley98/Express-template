import { getCorsOptions } from '../utilities/cors.util.js';

/**
 * Creates a middleware function that set our cors policy
 * @returns {Function} Express middleware function
 */
export const corsPolicy = () => {
  return (req, res, next) => {
    const corsOptions = getCorsOptions();
    const origin = req.headers.origin;

    // Check if the origin is in our allowed list
    if (corsOptions.allowedOrigins && corsOptions.allowedOrigins.includes(origin)) {
      // Set the specific origin rather than wildcard when credentials are needed
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Set allowed methods
      if (corsOptions.allowedMethods) {
        res.setHeader('Access-Control-Allow-Methods', corsOptions.allowedMethods.join(', '));
      }

      // Set allowed headers
      if (corsOptions.allowedHeaders) {
        res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
      }

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
    }

    next();
  };
};
