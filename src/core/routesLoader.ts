import express, { Application, Router } from 'express';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import logger from '../utilities/logger.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Type for Swagger spec if available
type SwaggerSpec = Record<string, unknown>;

/**
 * Regenerates the Swagger specification by re-importing the Swagger module.
 */
async function regenerateSwaggerSpec(): Promise<SwaggerSpec | null> {
  try {
    const swaggerModule = await import(`../config/swagger.config.ts?update=${Date.now()}`);
    const newSwaggerSpec: SwaggerSpec = swaggerModule.default;
    logger.info('📚 Swagger documentation regenerated');
    return newSwaggerSpec;
  } catch (error) {
    logger.error('❌ Failed to regenerate Swagger spec:', error);
    return null;
  }
}

/**
 * Dynamically loads and mounts versioned controller routes.
 */
function loadVersionedRoutes(app: Application, baseApiPath: string, controllersPath: string): void {
  const versions = fs.readdirSync(controllersPath);

  versions.forEach((version) => {
    const versionPath = path.join(controllersPath, version);
    if (!fs.lstatSync(versionPath).isDirectory()) return;

    const folders = fs.readdirSync(versionPath);
    folders.forEach((folder) => {
      const folderPath = path.join(versionPath, folder);
      if (!fs.lstatSync(folderPath).isDirectory()) return;

      const router: Router = express.Router();
      const files = fs.readdirSync(folderPath);

      files.forEach(async (file) => {
        if (file.endsWith('.controller.ts')) {
          const filePath = path.join(folderPath, file);
          try {
            const { default: controller } = await import(pathToFileURL(filePath).href);

            if (controller && typeof controller === 'function') {
              logger.info(
                `✅ Mounting [${baseApiPath}/${version}/${folder}] -> [${version}/${folder}/${file}]`
              );
              router.use(controller);
            } else {
              logger.warn(`⚠️ Controller ${version}/${folder}/${file} is invalid.`);
            }
          } catch (error) {
            logger.error(`❌ Failed to import controller: ${filePath}`, error);
          }
        }
      });

      app.use(`${baseApiPath}/${version}/${folder}`, router);
    });
  });
}

/**
 * Sets up file watchers and loads dynamic routes, refreshing Swagger on changes.
 */
function setupDynamicRoutes(
  app: Application,
  baseApiPath = '/api',
  controllersPath = path.join(__dirname, '..', 'controllers')
): { regenerateSwaggerSpec: () => Promise<SwaggerSpec | null> } {
  loadVersionedRoutes(app, baseApiPath, controllersPath);

  let swaggerUi: express.Router | undefined;

  try {
    swaggerUi = app._router.stack.find(
      (layer: { route?: { path: string }; handle: any }) =>
        layer.route && layer.route.path === '/api-docs'
    )?.handle as express.Router; // Now typing it as `express.Router`
  } catch (error) {
    logger.warn('⚠️ Could not find Swagger UI route for dynamic updates');
  }

  const watcher = chokidar.watch(controllersPath, {
    persistent: true,
    ignoreInitial: true,
  });

  const handleControllerChange = async (filePath: string) => {
    if (filePath.endsWith('.controller.ts')) {
      logger.info(`[CONTROLLER CHANGED] ${filePath}`);
      const updatedSpec = await regenerateSwaggerSpec();

      if (updatedSpec && swaggerUi) {
        logger.info('📚 Swagger UI will use updated spec on next request');
      }
    }
  };

  watcher.on('add', handleControllerChange);
  watcher.on('change', handleControllerChange);

  watcher.on('unlink', (filePath: string) => {
    if (filePath.endsWith('.controller.ts')) {
      logger.info(`[CONTROLLER REMOVED] ${filePath}`);
      regenerateSwaggerSpec();
    }
  });

  return { regenerateSwaggerSpec };
}

export { loadVersionedRoutes, setupDynamicRoutes, regenerateSwaggerSpec };
