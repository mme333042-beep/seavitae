/**
 * SeaVitae Express Application
 * Main application setup with middleware and routes
 */

import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // ==========================================================================
  // Security Middleware
  // ==========================================================================

  // Helmet for security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // ==========================================================================
  // Body Parsing Middleware
  // ==========================================================================

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ==========================================================================
  // Request Logging (Development)
  // ==========================================================================

  if (config.isDevelopment) {
    app.use((req, _res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  // ==========================================================================
  // API Routes
  // ==========================================================================

  app.use("/api", routes);

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
