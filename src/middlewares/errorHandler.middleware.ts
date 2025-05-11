import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utilities/appError.util.js';
import logger from '../utilities/logger.util.js';
import dotenv from 'dotenv';
dotenv.config();

export function errorHandlerMiddleware(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(err.stack);

  const statusCode = err instanceof AppError ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
