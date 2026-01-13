/**
 * SeaVitae Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";
import { AuthenticatedRequest, ApiResponse } from "../types";

/**
 * POST /auth/signup
 * Register a new user
 */
export async function signup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, role } = req.body;
    const { user, tokens } = await authService.signup({ email, password, role });

    const response: ApiResponse = {
      success: true,
      message: "Account created. Please verify your email.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        tokens,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/login
 * Login with email and password
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login({ email, password });

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        tokens,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/verify-email/:token
 * Verify email address with token
 */
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.params;
    const user = await authService.verifyEmail(token);

    const response: ApiResponse = {
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/resend-verification
 * Resend email verification link
 */
export async function resendVerification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    await authService.resendVerificationEmail(req.user.id);

    const response: ApiResponse = {
      success: true,
      message: "Verification email sent",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/forgot-password
 * Request password reset email
 */
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);

    // Always return success to prevent email enumeration
    const response: ApiResponse = {
      success: true,
      message: "If an account exists with this email, a reset link has been sent",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/reset-password/:token
 * Reset password with token
 */
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPassword(token, password);

    const response: ApiResponse = {
      success: true,
      message: "Password reset successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);

    const response: ApiResponse = {
      success: true,
      data: { tokens },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/me
 * Get current authenticated user
 */
export async function me(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await authService.getUserById(req.user.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/change-password
 * Change password for authenticated user
 */
export async function changePassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);

    const response: ApiResponse = {
      success: true,
      message: "Password changed successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
