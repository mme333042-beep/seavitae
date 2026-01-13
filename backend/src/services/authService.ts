/**
 * SeaVitae Authentication Service
 * Handles user registration, login, and authentication
 */

import { PrismaClient, User } from "@prisma/client";
import { hashPassword, comparePassword, validatePasswordStrength } from "../utils/password";
import { generateTokenPair, generateRandomToken, verifyRefreshToken } from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "./emailService";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import { SignupInput, LoginInput, TokenPair, JWTPayload, UserRole } from "../types";

const prisma = new PrismaClient();

// Token expiry times
const EMAIL_VERIFY_EXPIRY_HOURS = 24;
const PASSWORD_RESET_EXPIRY_HOURS = 1;

/**
 * Register a new user
 */
export async function signup(input: SignupInput): Promise<{ user: User; tokens: TokenPair }> {
  // Validate password strength
  const passwordErrors = validatePasswordStrength(input.password);
  if (passwordErrors.length > 0) {
    throw new BadRequestError("Password does not meet requirements", passwordErrors);
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new ConflictError("An account with this email already exists");
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Generate verification token
  const emailVerifyToken = generateRandomToken();
  const emailVerifyExpiry = new Date(
    Date.now() + EMAIL_VERIFY_EXPIRY_HOURS * 60 * 60 * 1000
  );

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      emailVerifyToken,
      emailVerifyExpiry,
    },
  });

  // Send verification email
  await sendVerificationEmail(user.email, emailVerifyToken);

  // Generate tokens
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
  };
  const tokens = generateTokenPair(payload);

  return { user, tokens };
}

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<{ user: User; tokens: TokenPair }> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Verify password
  const isValidPassword = await comparePassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Generate tokens
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
  };
  const tokens = generateTokenPair(payload);

  return { user, tokens };
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    throw new BadRequestError("Invalid verification token");
  }

  if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
    throw new BadRequestError("Verification token has expired");
  }

  // Update user as verified
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpiry: null,
    },
  });

  return updatedUser;
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.emailVerified) {
    throw new BadRequestError("Email is already verified");
  }

  // Generate new verification token
  const emailVerifyToken = generateRandomToken();
  const emailVerifyExpiry = new Date(
    Date.now() + EMAIL_VERIFY_EXPIRY_HOURS * 60 * 60 * 1000
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken,
      emailVerifyExpiry,
    },
  });

  await sendVerificationEmail(user.email, emailVerifyToken);
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return;
  }

  // Generate reset token
  const resetToken = generateRandomToken();
  const resetTokenExpiry = new Date(
    Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  await sendPasswordResetEmail(user.email, resetToken);
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // Validate password strength
  const passwordErrors = validatePasswordStrength(newPassword);
  if (passwordErrors.length > 0) {
    throw new BadRequestError("Password does not meet requirements", passwordErrors);
  }

  const user = await prisma.user.findUnique({
    where: { resetToken: token },
  });

  if (!user) {
    throw new BadRequestError("Invalid reset token");
  }

  if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
    throw new BadRequestError("Reset token has expired");
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(token: string): Promise<TokenPair> {
  const payload = verifyRefreshToken(token);

  if (!payload) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  // Verify user still exists
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  // Generate new tokens
  const newPayload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
  };

  return generateTokenPair(newPayload);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  // Validate new password strength
  const passwordErrors = validatePasswordStrength(newPassword);
  if (passwordErrors.length > 0) {
    throw new BadRequestError("Password does not meet requirements", passwordErrors);
  }

  // Hash new password and update
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
