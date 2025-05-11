import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import logger from './logger.util.js';
import { CorsConfig } from '@/models/cors.type.js';
let cachedConfig: CorsConfig | null = null; // Explicit type for cachedConfig

/**
 * Loads and parses the CORS configuration from a JSON file.
 * Caches the result and watches for updates.
 * @returns {void}
 */
export function loadCorsConfig(): void {
  // Get the directory name of the current module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const configPath = path.resolve(__dirname, '../config/cors.config.json');

  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    cachedConfig = JSON.parse(data);
    logger.info('✅ CORS config loaded');
  } catch (err) {
    logger.error('❌ Failed to load CORS config:', err);
    cachedConfig = null; // If failed to load, set as null
  }
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
 * @returns {CorsConfig | null} The cached CORS config or null if not loaded.
 */
export function getCorsOptions(): CorsConfig | null {
  return cachedConfig;
}
