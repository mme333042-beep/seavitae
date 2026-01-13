/**
 * SeaVitae Custom Error Classes
 * Standardized error handling across the application
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: string[];

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: string[],
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 400 Bad Request - Invalid input or malformed request
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", errors?: string[]) {
    super(message, 400, errors);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Unauthorized - Authentication required or failed
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden - Authenticated but not authorized
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict - Resource already exists or conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", errors?: string[]) {
    super(message, 422, errors);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, undefined, false);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}
