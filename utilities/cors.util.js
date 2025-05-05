import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import logger from './logger.util.js';

let cachedConfig = null;

/**
 * Loads and parses the CORS configuration from a JSON file.
 * Caches the result and watches for updates.
 * @returns {object} The current CORS config object.
 */
export function loadCorsConfig() {
  const configPath = path.resolve('config/cors.config.json');

  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    cachedConfig = JSON.parse(data);
    logger.info('✅ CORS config loaded');
  } catch (err) {
    logger.error('❌ Failed to load CORS config:', err);
    cachedConfig = {};
  }

  return cachedConfig;
}

// Initial load
loadCorsConfig();

// Watch for file changes
chokidar.watch('config/cors.config.json').on('change', () => {
  logger.info('🔁 CORS config changed. Reloading...');
  loadCorsConfig();
});

/**
 * Returns the current CORS config (cached).
 * Used to apply to CORS middleware.
 */
export function getCorsOptions() {
  return cachedConfig;
}
