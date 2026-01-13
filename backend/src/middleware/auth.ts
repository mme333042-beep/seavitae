/**
 * SeaVitae Authentication Middleware
 * JWT-based authentication and role-based access control
 */

import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { AuthenticatedRequest, UserRole } from "../types";

/**
 * Extract bearer token from Authorization header
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Authenticate user from JWT token
 * Attaches user info to request object
 */
export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError("Authentication token required");
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      emailVerified: payload.emailVerified,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require email verification
 * Must be used after authenticate middleware
 */
export function requireEmailVerified(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!req.user.emailVerified) {
      throw new ForbiddenError("Email verification required");
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require specific user role(s)
 * Must be used after authenticate middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(
          `This action requires one of the following roles: ${allowedRoles.join(", ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Require JOBSEEKER role
 * Shorthand for requireRole("JOBSEEKER")
 */
export function requireJobseeker(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  requireRole("JOBSEEKER")(req, res, next);
}

/**
 * Require EMPLOYER role
 * Shorthand for requireRole("EMPLOYER")
 */
export function requireEmployer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  requireRole("EMPLOYER")(req, res, next);
}

/**
 * Optional authentication
 * Attaches user to request if token is valid, but doesn't require it
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        req.user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          emailVerified: payload.emailVerified,
        };
      }
    }

    next();
  } catch {
    // Ignore errors for optional auth
    next();
  }
}
