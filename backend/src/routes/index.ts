/**
 * SeaVitae API Routes
 * Main router that combines all route modules
 */

import { Router } from "express";
import authRoutes from "./auth";
import cvRoutes from "./cv";
import employerRoutes from "./employer";
import messageRoutes from "./messages";

const router = Router();

/**
 * API Health Check
 */
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "SeaVitae API is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Authentication routes
 * @prefix /auth
 */
router.use("/auth", authRoutes);

/**
 * CV/Profile routes (Jobseeker)
 * @prefix /cv
 */
router.use("/cv", cvRoutes);

/**
 * Employer routes
 * @prefix /employer
 */
router.use("/employer", employerRoutes);

/**
 * Message routes
 * @prefix /messages
 */
router.use("/messages", messageRoutes);

export default router;
