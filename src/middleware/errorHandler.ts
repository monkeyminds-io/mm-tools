import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details in development
  if (config.isDevelopment) {
    console.error('❌ Error occurred:', {
      method: req.method,
      path: req.path,
      statusCode,
      message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  } else {
    // Log only essential info in production
    console.error(`❌ ${statusCode} - ${message} - ${req.method} ${req.path}`);
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      message: config.isDevelopment ? message : 'Something went wrong',
      statusCode,
      path: req.path,
      ...(config.isDevelopment && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
};

// Helper function to create operational errors
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};