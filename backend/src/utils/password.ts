/**
 * SeaVitae Password Utilities
 * Password hashing and validation using bcrypt
 */

import bcrypt from "bcrypt";
import { config } from "../config";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * Returns an array of validation errors (empty if valid)
 */
export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  const { minLength, requireUppercase, requireLowercase, requireNumber } =
    config.password;

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return errors;
}

/**
 * Check if password meets all requirements
 */
export function isValidPassword(password: string): boolean {
  return validatePasswordStrength(password).length === 0;
}
