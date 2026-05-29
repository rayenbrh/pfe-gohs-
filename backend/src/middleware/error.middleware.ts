import type { Request, Response, NextFunction } from 'express';
import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';
import multer from 'multer';

import logger from '../config/logger';
import { AppError } from '../utils/AppError';

interface MongooseValidationError extends Error {
  errors?: Record<string, { message: string }>;
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError('Route not found', 404, 'ROUTE_NOT_FOUND'));
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let error: AppError | Error = err;
  let statusCode = 500;
  let status: 'fail' | 'error' = 'error';
  let code: string | undefined;
  let message = err.message || 'Internal server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status as 'fail' | 'error';
    code = err.code;
    message = err.message;

    if (err.errors?.length) {
      res.status(statusCode).json({
        status,
        code,
        message: err.errors,
      });
      return;
    }
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    status = 'fail';
    message = 'Invalid ID format';
    code = 'INVALID_ID';
    error = new AppError(message, statusCode, code);
  } else if (err.name === 'ValidationError') {
    const validationErr = err as MongooseValidationError;
    statusCode = 400;
    status = 'fail';
    message = Object.values(validationErr.errors ?? {})
      .map((e) => e.message)
      .join('. ');
    code = 'VALIDATION_ERROR';
    error = new AppError(message, statusCode, code);
  } else if (err instanceof MongoServerError && err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern ?? {})[0] ?? 'field';
    statusCode = 409;
    status = 'fail';
    message = `${duplicateField.toUpperCase()} already exists`;
    code = 'DUPLICATE_KEY';
    error = new AppError(message, statusCode, code);
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    status = 'fail';
    message = 'Invalid token, please log in again';
    code = 'INVALID_TOKEN';
    error = new AppError(message, statusCode, code);
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    status = 'fail';
    message = 'Your token has expired';
    code = 'TOKEN_EXPIRED';
    error = new AppError(message, statusCode, code);
  } else if (err instanceof multer.MulterError) {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    status = 'fail';
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Unexpected file field'
          : err.message;
    code = err.code;
    error = new AppError(message, statusCode, code);
  }

  if (statusCode >= 500) {
    logger.error('Server error', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      message: err.message,
      stack: err.stack,
    });
  }

  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    status,
    code,
    message,
    ...(isDev && { stack: err.stack, error: err }),
  });
}
