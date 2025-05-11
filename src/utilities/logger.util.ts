import winston, { format, transports, Logger } from 'winston';
import { TransformableInfo } from 'logform';
import morgan, { StreamOptions } from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Formats a Date object into a custom timestamp string.
 *
 * @param date - The date to format.
 * @returns The formatted date string in `YYYY-MM-DD HH:mm:ss.SSS` format.
 */
function formatDate(date: Date): string {
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
 * Adds a custom-formatted timestamp to log entries.
 */
const customTimestamp = format((info) => {
  info.timestamp = formatDate(new Date());
  return info;
});

/**
 * Custom format for Winston console output.
 */
const consoleFormat = format.printf((info: TransformableInfo): string => {
  return info.message as string;
});

/**
 * Winston logger instance with file and console transports.
 */
const logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(customTimestamp(), format.json()),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({
      format: consoleFormat,
    }),
  ],
});

/**
 * Stream configuration for Morgan to use Winston.
 */
const stream: StreamOptions = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

/**
 * Morgan middleware configured to log HTTP requests using Winston.
 */
export const morganMiddleware = morgan(
  ':method :url :status :response-time ms - :res[content-length]',
  { stream }
);

export default logger;
