/**
 * SeaVitae Validation Middleware
 * Request validation using express-validator
 */

import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult, ValidationChain } from "express-validator";
import { ValidationError } from "../utils/errors";
// Removed unused imports

/**
 * Run validations and throw error if any fail
 */
export function handleValidationErrors(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => {
      if (err.type === "field") {
        return `${err.path}: ${err.msg}`;
      }
      return err.msg;
    });
    throw new ValidationError("Validation failed", errorMessages);
  }

  next();
}

/**
 * Combine validation chains with error handler
 */
export function validate(validations: ValidationChain[]) {
  return [...validations, handleValidationErrors];
}

// ============================================================================
// AUTH VALIDATIONS
// ============================================================================

export const signupValidation = validate([
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .isIn(["JOBSEEKER", "EMPLOYER"])
    .withMessage("Role must be JOBSEEKER or EMPLOYER"),
]);

export const loginValidation = validate([
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
]);

export const verifyEmailValidation = validate([
  param("token")
    .notEmpty()
    .withMessage("Verification token is required"),
]);

export const forgotPasswordValidation = validate([
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
]);

export const resetPasswordValidation = validate([
  param("token")
    .notEmpty()
    .withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
]);

export const refreshTokenValidation = validate([
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required"),
]);

// ============================================================================
// JOBSEEKER PROFILE VALIDATIONS
// ============================================================================

export const createProfileValidation = validate([
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 100 })
    .withMessage("Full name must be 100 characters or less"),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("preferredRole")
    .trim()
    .notEmpty()
    .withMessage("Preferred role is required"),
  body("bio")
    .trim()
    .notEmpty()
    .withMessage("Professional summary is required")
    .isLength({ min: 50, max: 2000 })
    .withMessage("Bio must be between 50 and 2000 characters"),
  body("yearsExperience")
    .isInt({ min: 0, max: 50 })
    .withMessage("Years of experience must be between 0 and 50"),
  body("age")
    .optional()
    .isInt({ min: 16, max: 100 })
    .withMessage("Age must be between 16 and 100"),
  body("skills")
    .isArray({ min: 1 })
    .withMessage("At least one skill is required"),
  body("skills.*")
    .trim()
    .notEmpty()
    .withMessage("Skill cannot be empty"),
  body("experiences")
    .isArray({ min: 1 })
    .withMessage("At least one experience is required"),
  body("experiences.*.title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required"),
  body("experiences.*.company")
    .trim()
    .notEmpty()
    .withMessage("Company is required"),
  body("experiences.*.location")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),
  body("experiences.*.startDate")
    .isISO8601()
    .withMessage("Valid start date is required"),
  body("experiences.*.description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
  body("education")
    .isArray({ min: 1 })
    .withMessage("At least one education entry is required"),
  body("education.*.degree")
    .trim()
    .notEmpty()
    .withMessage("Degree is required"),
  body("education.*.institution")
    .trim()
    .notEmpty()
    .withMessage("Institution is required"),
  body("education.*.location")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),
  body("education.*.graduationYear")
    .isInt({ min: 1950, max: 2030 })
    .withMessage("Valid graduation year is required"),
]);

export const updateProfileValidation = validate([
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty")
    .isLength({ max: 100 }),
  body("city")
    .optional()
    .trim()
    .notEmpty(),
  body("preferredRole")
    .optional()
    .trim()
    .notEmpty(),
  body("bio")
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 }),
  body("yearsExperience")
    .optional()
    .isInt({ min: 0, max: 50 }),
  body("age")
    .optional()
    .isInt({ min: 16, max: 100 }),
]);

export const toggleVisibilityValidation = validate([
  body("isVisible")
    .isBoolean()
    .withMessage("isVisible must be a boolean"),
]);

// ============================================================================
// EMPLOYER PROFILE VALIDATIONS
// ============================================================================

export const createEmployerProfileValidation = validate([
  body("type")
    .isIn(["INDIVIDUAL", "COMPANY"])
    .withMessage("Type must be INDIVIDUAL or COMPANY"),
  body("displayName")
    .trim()
    .notEmpty()
    .withMessage("Display name is required"),
  body("city")
    .optional()
    .trim(),
  body("companyName")
    .optional()
    .trim(),
  body("website")
    .optional()
    .isURL()
    .withMessage("Website must be a valid URL"),
  body("linkedIn")
    .optional()
    .isURL()
    .withMessage("LinkedIn must be a valid URL"),
]);

// ============================================================================
// SEARCH VALIDATIONS
// ============================================================================

export const searchCVValidation = validate([
  query("keywords")
    .optional()
    .trim(),
  query("city")
    .optional()
    .trim(),
  query("skills")
    .optional()
    .customSanitizer((value) => {
      if (typeof value === "string") {
        return value.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      return value;
    }),
  query("yearsExperienceMin")
    .optional()
    .isInt({ min: 0 })
    .toInt(),
  query("yearsExperienceMax")
    .optional()
    .isInt({ min: 0 })
    .toInt(),
  query("ageMin")
    .optional()
    .isInt({ min: 16 })
    .toInt(),
  query("ageMax")
    .optional()
    .isInt({ max: 100 })
    .toInt(),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt(),
]);

// ============================================================================
// MESSAGE VALIDATIONS
// ============================================================================

export const sendMessageValidation = validate([
  body("receiverId")
    .isUUID()
    .withMessage("Valid receiver ID is required"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 5000 })
    .withMessage("Message must be 5000 characters or less"),
]);

// ============================================================================
// COMMON VALIDATIONS
// ============================================================================

export const uuidParamValidation = validate([
  param("id")
    .isUUID()
    .withMessage("Valid ID is required"),
]);

export const paginationValidation = validate([
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt(),
]);
