/**
 * SeaVitae Authentication Routes
 */

import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import {
  signupValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
} from "../middleware/validate";

const router = Router();

/**
 * @route   POST /auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", signupValidation, authController.signup);

/**
 * @route   POST /auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post("/login", loginValidation, authController.login);

/**
 * @route   GET /auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get("/verify-email/:token", verifyEmailValidation, authController.verifyEmail);

/**
 * @route   POST /auth/resend-verification
 * @desc    Resend verification email
 * @access  Private
 */
router.post("/resend-verification", authenticate, authController.resendVerification);

/**
 * @route   POST /auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post("/forgot-password", forgotPasswordValidation, authController.forgotPassword);

/**
 * @route   POST /auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  "/reset-password/:token",
  resetPasswordValidation,
  authController.resetPassword
);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token
 * @access  Public (with valid refresh token)
 */
router.post("/refresh", refreshTokenValidation, authController.refresh);

/**
 * @route   GET /auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get("/me", authenticate, authController.me);

/**
 * @route   POST /auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post("/change-password", authenticate, authController.changePassword);

export default router;
