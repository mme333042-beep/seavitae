/**
 * SeaVitae Error Handler Middleware
 * Centralized error handling for Express
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { config } from "../config";
import { ApiResponse } from "../types";

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error in development
  if (config.isDevelopment) {
    console.error("Error:", err);
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      errors: err.errors,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as { code?: string; meta?: { target?: string[] } };

    if (prismaError.code === "P2002") {
      // Unique constraint violation
      const field = prismaError.meta?.target?.[0] || "field";
      const response: ApiResponse = {
        success: false,
        message: `A record with this ${field} already exists`,
      };
      res.status(409).json(response);
      return;
    }

    if (prismaError.code === "P2025") {
      // Record not found
      const response: ApiResponse = {
        success: false,
        message: "Record not found",
      };
      res.status(404).json(response);
      return;
    }
  }

  // Handle validation errors from express-validator
  if (err.name === "ValidationError") {
    const response: ApiResponse = {
      success: false,
      message: "Validation failed",
      errors: [err.message],
    };
    res.status(422).json(response);
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    const response: ApiResponse = {
      success: false,
      message: "Invalid or expired token",
    };
    res.status(401).json(response);
    return;
  }

  // Default to 500 Internal Server Error
  const response: ApiResponse = {
    success: false,
    message: config.isDevelopment ? err.message : "Internal server error",
  };
  res.status(500).json(response);
}

/**
 * 404 Not Found handler for undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  };
  res.status(404).json(response);
}
