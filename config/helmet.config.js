import helmet from 'helmet';

/**
 * @function setupHelmet
 * @description Configures security-related HTTP headers using Helmet middleware.
 * Custom policies are applied to enhance protection against common vulnerabilities
 * like XSS, clickjacking, and content injection.
 *
 * @param {import('express').Application} app - The Express application instance
 * @returns {void}
 */
const setupHelmet = (app) => {
  app.use(
    helmet({
      /**
       * @property {Object} contentSecurityPolicy
       * Defines which external sources the browser should allow content from.
       */
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          scriptSrc: ["'self'", 'https:', "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://localhost:*'],
        },
      },

      /**
       * @property {Object} crossOriginResourcePolicy
       * Prevents other origins from reading resources.
       */
      crossOriginResourcePolicy: { policy: 'same-origin' },

      /**
       * @property {Object} frameguard
       * Prevents clickjacking by disallowing the site to be framed.
       */
      frameguard: { action: 'deny' },

      /**
       * @property {Object} referrerPolicy
       * Controls how much referrer information is sent.
       */
      referrerPolicy: { policy: 'no-referrer' },

      /**
       * @property {Boolean} xssFilter
       * Enables basic protection against reflected XSS attacks in older browsers.
       */
      xssFilter: true,

      /**
       * @property {Boolean} hidePoweredBy
       * Removes the X-Powered-By header for security through obscurity.
       */
      hidePoweredBy: true,
    })
  );
};

export default setupHelmet;
