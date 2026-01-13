/**
 * SeaVitae Type Definitions
 * Central type definitions for the backend API
 */

import { Request } from "express";
// Define enums as string literal types (SQLite doesnt support enums)
export type UserRole = "JOBSEEKER" | "EMPLOYER";
export type EmployerType = "INDIVIDUAL" | "COMPANY";
export type LanguageProficiency = "NATIVE" | "FLUENT" | "ADVANCED" | "INTERMEDIATE" | "BASIC";

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
  };
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface SignupInput {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ============================================================================
// JOBSEEKER PROFILE TYPES
// ============================================================================

export interface CreateJobseekerProfileInput {
  fullName: string;
  city: string;
  preferredRole: string;
  bio: string;
  age?: number;
  yearsExperience: number;
  skills: string[];
  experiences: ExperienceInput[];
  education: EducationInput[];
  languages?: LanguageInput[];
  certifications?: CertificationInput[];
  projects?: ProjectInput[];
  publications?: PublicationInput[];
}

export interface UpdateJobseekerProfileInput {
  fullName?: string;
  city?: string;
  preferredRole?: string;
  bio?: string;
  age?: number;
  yearsExperience?: number;
  skills?: string[];
  experiences?: ExperienceInput[];
  education?: EducationInput[];
  languages?: LanguageInput[];
  certifications?: CertificationInput[];
  projects?: ProjectInput[];
  publications?: PublicationInput[];
}

export interface ExperienceInput {
  id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string; // ISO date string
  endDate?: string | null;
  description: string;
  order?: number;
}

export interface EducationInput {
  id?: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: number;
  order?: number;
}

export interface LanguageInput {
  name: string;
  proficiency: LanguageProficiency;
}

export interface CertificationInput {
  id?: string;
  name: string;
  issuer: string;
  year: number;
}

export interface ProjectInput {
  id?: string;
  name: string;
  description: string;
  link?: string;
}

export interface PublicationInput {
  id?: string;
  title: string;
  venue: string;
  link?: string;
}

// ============================================================================
// EMPLOYER PROFILE TYPES
// ============================================================================

export interface CreateEmployerProfileInput {
  type: EmployerType;
  displayName: string;
  city?: string;
  companyName?: string;
  website?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  linkedIn?: string;
}

export interface UpdateEmployerProfileInput {
  displayName?: string;
  city?: string;
  companyName?: string;
  website?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  linkedIn?: string;
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface CVSearchFilters {
  keywords?: string;
  city?: string;
  skills?: string[];
  yearsExperienceMin?: number;
  yearsExperienceMax?: number;
  ageMin?: number;
  ageMax?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// CV SNAPSHOT TYPES
// ============================================================================

export interface CVSnapshotData {
  fullName: string;
  city: string;
  preferredRole: string;
  bio: string;
  yearsExperience: number;
  skills: string[];
  experiences: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    graduationYear: number;
  }[];
  languages: {
    name: string;
    proficiency: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: number;
  }[];
  projects: {
    name: string;
    description: string;
    link: string | null;
  }[];
  publications: {
    title: string;
    venue: string;
    link: string | null;
  }[];
  savedAt: string;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface SendMessageInput {
  receiverId: string;
  content: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Re-export Prisma enums for convenience
