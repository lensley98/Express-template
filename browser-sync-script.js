import browserSync from 'browser-sync';
import logger from './utilities/logger.util.js'; // Import your Winston logger

/**
 * Port on which the Express server is running.
 * @type {number|string}
 */
const EXPRESS_PORT = process.env.PORT || 4003;

/**
 * Port on which BrowserSync will serve the proxied content.
 * @type {number|string}
 */
const BROWSER_SYNC_PORT = process.env.BROWSER_SYNC_PORT || 4004;

// Log the start of BrowserSync with the configured ports
logger.info(
  `Starting Browser-Sync proxy for localhost:${EXPRESS_PORT}/api-docs on port ${BROWSER_SYNC_PORT}`
);

/**
 * Initializes BrowserSync to proxy the Express API documentation
 * and watch for changes in relevant source files to trigger reloads.
 */
browserSync.init({
  /**
   * Proxy target for BrowserSync.
   * This is the endpoint of the API documentation served by Express.
   * @type {string}
   */
  proxy: `localhost:${EXPRESS_PORT}/api-docs`,

  /**
   * Port where BrowserSync will run.
   * @type {number|string}
   */
  port: BROWSER_SYNC_PORT,

  /**
   * Files to watch for changes. Trigger a browser reload on changes.
   * @type {string[]}
   */
  files: ['controllers/**/*.js', 'config/swagger.config.js', 'config/cors.config.json' , 'validators/**/*.js', 'middlewares/**/*.js'],

  /**
   * Automatically open the browser when BrowserSync starts.
   * @type {boolean}
   */
  open: true,

  /**
   * Show notifications in the browser when events happen.
   * @type {boolean}
   */
  notify: true,

  /**
   * Disable the built-in BrowserSync UI.
   * @type {boolean}
   */
  ui: false,

  /**
   * Log verbosity level.
   * @type {"silent"|"info"|"debug"}
   */
  logLevel: 'info',

  /**
   * Prefix to use in BrowserSync logs.
   * @type {string}
   */
  logPrefix: 'BrowserSync',

  /**
   * Delay in milliseconds before reloading the browser after a file change.
   * Useful for large file changes like Swagger docs.
   * @type {number}
   */
  reloadDelay: 1000,

  /**
   * Disable automatic CSS injection. Forces full page reloads.
   * @type {boolean}
   */
  injectChanges: false,

  /**
   * Debounce delay in milliseconds. Browser will reload after this quiet time.
   * @type {number}
   */
  reloadDebounce: 2000,

  /**
   * Options for file watching behavior.
   */
  watchOptions: {
    /**
     * Ignore initial file add events.
     * @type {boolean}
     */
    ignoreInitial: true,

    /**
     * Ignore changes in these paths.
     * @type {string[]}
     */
    ignored: ['node_modules/**'],
  },
});

// Log that BrowserSync has started successfully
logger.info(`Browser-Sync started. Access your app at http://localhost:${BROWSER_SYNC_PORT}`);
