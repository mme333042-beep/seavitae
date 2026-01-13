/**
 * SeaVitae CV/Profile Routes (Jobseeker)
 */

import { Router } from "express";
import * as cvController from "../controllers/cvController";
import { authenticate, requireEmailVerified, requireJobseeker } from "../middleware/auth";
import {
  createProfileValidation,
  updateProfileValidation,
  toggleVisibilityValidation,
} from "../middleware/validate";

const router = Router();

// All routes require authentication and JOBSEEKER role
router.use(authenticate, requireEmailVerified, requireJobseeker);

/**
 * @route   GET /cv/profile
 * @desc    Get current user's CV profile
 * @access  Private (Jobseeker)
 */
router.get("/profile", cvController.getMyProfile);

/**
 * @route   POST /cv/profile
 * @desc    Create CV profile
 * @access  Private (Jobseeker)
 */
router.post("/profile", createProfileValidation, cvController.createProfile);

/**
 * @route   PUT /cv/profile
 * @desc    Update CV profile
 * @access  Private (Jobseeker)
 */
router.put("/profile", updateProfileValidation, cvController.updateProfile);

/**
 * @route   GET /cv/visibility
 * @desc    Get visibility status
 * @access  Private (Jobseeker)
 */
router.get("/visibility", cvController.getVisibility);

/**
 * @route   PUT /cv/visibility
 * @desc    Toggle CV visibility
 * @access  Private (Jobseeker)
 */
router.put("/visibility", toggleVisibilityValidation, cvController.toggleVisibility);

/**
 * @route   GET /cv/download
 * @desc    Download CV as PDF
 * @access  Private (Jobseeker only - employers cannot download)
 */
router.get("/download", cvController.downloadPDF);

export default router;
