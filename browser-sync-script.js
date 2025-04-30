import browserSync from 'browser-sync';

const EXPRESS_PORT = process.env.PORT || 4003;
const BROWSER_SYNC_PORT = process.env.BROWSER_SYNC_PORT || 4004;

/**
 * Starts Browser-Sync to proxy an Express app and watch for file changes.
 *
 * @function
 * @description This script proxies the `/api-docs` route of your Express app and reloads the browser on changes to files in specified directories.
 * @param {string} EXPRESS_PORT - The port where your Express server is running.
 * @param {string} BROWSER_SYNC_PORT - The port on which Browser-Sync should run.
*/
console.log(`Starting Browser-Sync proxy for localhost:${EXPRESS_PORT}/api-docs on port ${BROWSER_SYNC_PORT}`);

browserSync.init({
    proxy: `localhost:${EXPRESS_PORT}/api-docs`,  // Proxy the Express app's API documentation
    port: BROWSER_SYNC_PORT,                    // Port for Browser-Sync
    files: ['controllers/**/*.js', 'config/swagger.js'], // Files to watch for changes
    open: true,                                  // Automatically open the browser
    notify: true,                                // Show notifications in the browser
    ui: false,                                   // Disable the BrowserSync UI
    logLevel: "debug",                           // Log level for BrowserSync
    logPrefix: "BrowserSync",                    // Prefix for log messages
    reloadDelay: 1000,                           // Delay before reloading after a file change
    injectChanges: false,                        // Do not inject changes directly
});

console.log(`Browser-Sync started. Access your app at http://localhost:${BROWSER_SYNC_PORT}`);
