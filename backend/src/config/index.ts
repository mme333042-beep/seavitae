/**
 * SeaVitae Configuration
 * Centralized configuration management
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Validates that required environment variables are set
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config = {
  // Environment
  env: optionalEnv("NODE_ENV", "development"),
  isDevelopment: optionalEnv("NODE_ENV", "development") === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Server
  port: parseInt(optionalEnv("PORT", "3001"), 10),
  host: optionalEnv("HOST", "0.0.0.0"),

  // Database
  databaseUrl: requireEnv("DATABASE_URL"),

  // JWT
  jwt: {
    accessSecret: requireEnv("JWT_ACCESS_SECRET"),
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    accessExpiresIn: optionalEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
    refreshExpiresIn: optionalEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  // Email
  email: {
    host: optionalEnv("SMTP_HOST", "smtp.example.com"),
    port: parseInt(optionalEnv("SMTP_PORT", "587"), 10),
    secure: optionalEnv("SMTP_SECURE", "false") === "true",
    user: optionalEnv("SMTP_USER", ""),
    password: optionalEnv("SMTP_PASSWORD", ""),
    from: optionalEnv("EMAIL_FROM", "noreply@seavitae.com"),
  },

  // Frontend URL (for email links)
  frontendUrl: optionalEnv("FRONTEND_URL", "http://localhost:3000"),

  // CORS
  cors: {
    origin: optionalEnv("CORS_ORIGIN", "http://localhost:3000"),
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(optionalEnv("RATE_LIMIT_WINDOW_MS", "900000"), 10), // 15 minutes
    max: parseInt(optionalEnv("RATE_LIMIT_MAX", "100"), 10),
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
} as const;

export type Config = typeof config;
