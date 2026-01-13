/**
 * SeaVitae Server Entry Point
 * Starts the Express server with Prisma database connection
 */

import { PrismaClient } from "@prisma/client";
import { createApp } from "./app";
import { config } from "./config";

const prisma = new PrismaClient();

/**
 * Start the server
 */
async function main(): Promise<void> {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✓ Database connected successfully");

    // Create Express app
    const app = createApp();

    // Start server
    app.listen(config.port, config.host, () => {
      console.log("=".repeat(50));
      console.log("SeaVitae API Server");
      console.log("=".repeat(50));
      console.log(`Environment: ${config.env}`);
      console.log(`Server:      http://${config.host}:${config.port}`);
      console.log(`API Base:    http://${config.host}:${config.port}/api`);
      console.log(`Health:      http://${config.host}:${config.port}/api/health`);
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown(): Promise<void> {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  console.log("Database disconnected");
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
main();
