/**
 * SeaVitae Employer Routes
 */

import { Router } from "express";
import * as employerController from "../controllers/employerController";
import { authenticate, requireEmailVerified, requireEmployer } from "../middleware/auth";
import {
  createEmployerProfileValidation,
  searchCVValidation,
  uuidParamValidation,
  paginationValidation,
} from "../middleware/validate";

const router = Router();

// All routes require authentication and EMPLOYER role
router.use(authenticate, requireEmailVerified, requireEmployer);

/**
 * @route   GET /employer/profile
 * @desc    Get current employer's profile
 * @access  Private (Employer)
 */
router.get("/profile", employerController.getMyProfile);

/**
 * @route   POST /employer/profile
 * @desc    Create employer profile
 * @access  Private (Employer)
 */
router.post("/profile", createEmployerProfileValidation, employerController.createProfile);

/**
 * @route   PUT /employer/profile
 * @desc    Update employer profile
 * @access  Private (Employer)
 */
router.put("/profile", employerController.updateProfile);

/**
 * @route   GET /employer/search
 * @desc    Search visible CV profiles
 * @access  Private (Employer)
 */
router.get("/search", searchCVValidation, employerController.searchCVs);

/**
 * @route   GET /employer/cv/:id
 * @desc    Get full CV profile by ID
 * @access  Private (Employer)
 */
router.get("/cv/:id", uuidParamValidation, employerController.getCVProfile);

/**
 * @route   POST /employer/cv/:id/save
 * @desc    Save CV snapshot
 * @access  Private (Employer)
 */
router.post("/cv/:id/save", uuidParamValidation, employerController.saveCV);

/**
 * @route   GET /employer/saved
 * @desc    Get saved CV snapshots
 * @access  Private (Employer)
 */
router.get("/saved", paginationValidation, employerController.getSavedCVs);

/**
 * @route   GET /employer/saved/:id
 * @desc    Get specific saved CV snapshot
 * @access  Private (Employer)
 */
router.get("/saved/:id", uuidParamValidation, employerController.getSavedCV);

/**
 * @route   DELETE /employer/saved/:id
 * @desc    Delete saved CV snapshot
 * @access  Private (Employer)
 */
router.delete("/saved/:id", uuidParamValidation, employerController.deleteSavedCV);

export default router;
