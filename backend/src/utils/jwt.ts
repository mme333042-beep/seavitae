/**
 * SeaVitae JWT Utilities
 * Token generation and verification
 */

import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { JWTPayload, TokenPair } from "../types";

/**
 * Generate an access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as SignOptions);
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as SignOptions);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload & JWTPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      emailVerified: decoded.emailVerified,
    };
  } catch {
    return null;
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload & JWTPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      emailVerified: decoded.emailVerified,
    };
  } catch {
    return null;
  }
}

/**
 * Decode a token without verification (for debugging)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Generate a random token for email verification or password reset
 */
export function generateRandomToken(): string {
  return [...Array(64)]
    .map(() => Math.random().toString(36)[2])
    .join("");
}
