import winston from 'winston';
import morgan from 'morgan';

/**
 * Formats a Date object into a custom timestamp string.
 *
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string in `YYYY-MM-DD HH:mm:ss.SSS` format.
 */
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Custom format for Winston console output.
 * Only outputs the message (no metadata or levels).
 */
const consoleFormat = winston.format.printf(({ message }) => {
  return message;
});

/**
 * Adds a custom-formatted timestamp to log entries.
 */
const customTimestamp = winston.format((info) => {
  info.timestamp = formatDate(new Date());
  return info;
});

/**
 * Winston logger instance with file and console transports.
 * Logs are output in JSON format with a custom timestamp.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(customTimestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

/**
 * Morgan middleware configured to use Winston for logging HTTP requests.
 *
 * @type {import('morgan').Middleware}
 */
export const morganMiddleware = morgan(
  ':method :url :status :response-time ms - :res[content-length]',
  {
    stream: {
      /**
       * Writes a log message to Winston.
       * Removes the trailing newline added by Morgan.
       *
       * @param {string} message - The message to log.
       */
      write: (message) => {
        logger.info(message.trim());
      },
    },
  }
);

export default logger;
