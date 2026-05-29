export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: string;
  errors?: ValidationErrorItem[];

  constructor(message: string | ValidationErrorItem[], statusCode: number, code?: string) {
    if (Array.isArray(message)) {
      super('Validation failed');
      this.errors = message;
    } else {
      super(message);
    }
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
