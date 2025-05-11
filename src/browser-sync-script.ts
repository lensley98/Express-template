import browserSync from 'browser-sync';
import dotenv from 'dotenv';

dotenv.config();

const EXPRESS_PORT = Number(process.env.PORT) || 4003;
const BROWSER_SYNC_PORT = Number(process.env.BROWSER_SYNC_PORT) || 4004;

browserSync.init({
  proxy: `http://localhost:${EXPRESS_PORT}/api-docs`,
  port: BROWSER_SYNC_PORT,
  open: true,
  notify: true,
  reloadDelay: 1000,
  injectChanges: false,
  reloadDebounce: 2000,
  watchOptions: {
    ignoreInitial: true,
  },
  files: [
    'src/controllers/**/*.ts',
    'src/config/swagger.config.ts',
    'src/config/cors.config.json',
    'src/validators/**/*.ts',
    'src/middlewares/**/*.ts',
  ],
});

