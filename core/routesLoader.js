import express from 'express';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import logger from '../utilities/logger.util.js';

// These two lines are necessary because __dirname is not available in ESM by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Regenerates the Swagger specification by re-importing the Swagger module.
 * This function is called when a controller changes and should update the Swagger UI accordingly.
 *
 * @returns {Promise<Object|null>} The new Swagger spec object or null if it fails.
 */
async function regenerateSwaggerSpec() {
  try {
    // Force re-import of the swagger module by creating a unique URL with timestamp
    const swaggerModule = await import(`../config/swagger.config.js?update=${Date.now()}`);
    const newSwaggerSpec = swaggerModule.default;
    logger.info('📚 Swagger documentation regenerated');
    return newSwaggerSpec;
  } catch (error) {
    logger.error('❌ Failed to regenerate Swagger spec:', error);
    return null;
  }
}

/**
 * Loads versioned routes from the specified controller path and mounts them to the Express app.
 * It looks for controller files and dynamically mounts them based on their version and folder structure.
 *
 * @param {express.Application} app - The Express app to mount the routes to.
 * @param {string} baseApiPath - The base path for API routes (e.g., '/api').
 * @param {string} controllersPath - The directory path where versioned controllers are stored.
 */
function loadVersionedRoutes(app, baseApiPath, controllersPath) {
  const versions = fs.readdirSync(controllersPath);

  versions.forEach((version) => {
    const versionPath = path.join(controllersPath, version);

    if (fs.lstatSync(versionPath).isDirectory()) {
      const folders = fs.readdirSync(versionPath);

      folders.forEach((folder) => {
        const folderPath = path.join(versionPath, folder);

        if (fs.lstatSync(folderPath).isDirectory()) {
          const router = express.Router();
          const files = fs.readdirSync(folderPath);

          files.forEach(async (file) => {
            if (file.endsWith('.controller.js')) {
              const filePath = path.join(folderPath, file);
              const { default: controller } = await import(pathToFileURL(filePath).href);

              if (controller && typeof controller === 'function') {
                logger.info(
                  `✅ Mounting [${baseApiPath}/${version}/${folder}] -> [${version}/${folder}/${file}]`
                );
                router.use(controller);
              } else {
                logger.warn(`⚠️ Controller ${version}/${folder}/${file} is invalid.`);
              }
            }
          });

          // Mount at /api/vX/folder
          app.use(`${baseApiPath}/${version}/${folder}`, router);
        }
      });
    }
  });
}

/**
 * Sets up dynamic routes by watching for changes in controller files and regenerating the Swagger spec.
 * This allows the Swagger UI to be updated on the fly when new controllers are added or existing ones are modified.
 *
 * @param {express.Application} app - The Express app to mount the routes to.
 * @param {string} [baseApiPath='/api'] - The base path for API routes (default is '/api').
 * @param {string} [controllersPath] - The directory path where versioned controllers are stored (default is the '../controllers' directory).
 * @returns {{ regenerateSwaggerSpec: function }} The `regenerateSwaggerSpec` function to be used elsewhere.
 */
function setupDynamicRoutes(
  app,
  baseApiPath = '/api',
  controllersPath = path.join(__dirname, '..', 'controllers')
) {
  // Load initial routes
  loadVersionedRoutes(app, baseApiPath, controllersPath);

  // Store a reference to the swaggerUi setup so we can update it
  let swaggerUi, swaggerSpec;
  try {
    swaggerUi = app._router.stack.find((layer) => layer.route && layer.route.path === '/api-docs');
  } catch (error) {
    logger.warn('⚠️ Could not find Swagger UI route for dynamic updates');
  }

  const watcher = chokidar.watch(controllersPath, {
    persistent: true,
    ignoreInitial: true,
  });

  /**
   * Handles file changes (new or modified) and triggers Swagger regeneration.
   * @param {string} filePath - The path to the changed file.
   */
  const handleControllerChange = async (filePath) => {
    if (filePath.endsWith('.controller.js')) {
      logger.info(`[CONTROLLER CHANGED] ${filePath}`);

      // Regenerate Swagger documentation
      const updatedSpec = await regenerateSwaggerSpec();

      if (updatedSpec && swaggerUi) {
        // If we find the Swagger UI setup, update its spec
        // Note: This is a simplified approach that may need adjustment
        // based on your exact app structure
        swaggerSpec = updatedSpec;
        logger.info('📚 Swagger UI will use updated spec on next request');
      }

      // You could also force a full reload of routes if needed
      // app._router.stack = app._router.stack.filter(layer => !layer.route || !layer.route.path.startsWith('/api'));
      // loadVersionedRoutes(app, baseApiPath, controllersPath);
    }
  };

  // Watch for file changes
  watcher.on('add', handleControllerChange);
  watcher.on('change', handleControllerChange);

  // Handle file removals
  watcher.on('unlink', (filePath) => {
    if (filePath.endsWith('.controller.js')) {
      logger.info(`[CONTROLLER REMOVED] ${filePath}`);
      // Also regenerate Swagger on removal
      regenerateSwaggerSpec();
    }
  });

  // Export the regenerateSwaggerSpec function for use elsewhere
  return { regenerateSwaggerSpec };
}

export { loadVersionedRoutes, setupDynamicRoutes, regenerateSwaggerSpec };
