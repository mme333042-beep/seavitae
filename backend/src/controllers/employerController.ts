/**
 * SeaVitae Employer Controller
 * Handles HTTP requests for employer-related endpoints
 */

import { Response, NextFunction } from "express";
import * as employerService from "../services/employerService";
import { AuthenticatedRequest, ApiResponse, CVSearchFilters, PaginationParams } from "../types";
import { config } from "../config";

/**
 * GET /employer/profile
 * Get current employer's profile
 */
export async function getMyProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const profile = await employerService.getEmployerProfileByUserId(req.user.id);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Employer profile not found. Please complete your profile.",
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: { profile },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /employer/profile
 * Create employer profile
 */
export async function createProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const profile = await employerService.createEmployerProfile(req.user.id, req.body);

    const response: ApiResponse = {
      success: true,
      message: "Employer profile created successfully",
      data: { profile },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /employer/profile
 * Update employer profile
 */
export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const profile = await employerService.updateEmployerProfile(req.user.id, req.body);

    const response: ApiResponse = {
      success: true,
      message: "Profile updated successfully",
      data: { profile },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /employer/search
 * Search visible CV profiles
 */
export async function searchCVs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Parse filters from query
    const filters: CVSearchFilters = {
      keywords: req.query.keywords as string | undefined,
      city: req.query.city as string | undefined,
      skills: req.query.skills as string[] | undefined,
      yearsExperienceMin: req.query.yearsExperienceMin
        ? parseInt(req.query.yearsExperienceMin as string, 10)
        : undefined,
      yearsExperienceMax: req.query.yearsExperienceMax
        ? parseInt(req.query.yearsExperienceMax as string, 10)
        : undefined,
      ageMin: req.query.ageMin
        ? parseInt(req.query.ageMin as string, 10)
        : undefined,
      ageMax: req.query.ageMax
        ? parseInt(req.query.ageMax as string, 10)
        : undefined,
    };

    // Parse pagination
    const pagination: PaginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit
        ? Math.min(parseInt(req.query.limit as string, 10), config.pagination.maxLimit)
        : config.pagination.defaultLimit,
    };

    const result = await employerService.searchCVs(filters, pagination);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /employer/cv/:id
 * Get full CV profile by ID
 */
export async function getCVProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const profile = await employerService.getFullCVProfile(id);

    const response: ApiResponse = {
      success: true,
      data: { profile },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /employer/cv/:id/save
 * Save CV snapshot
 */
export async function saveCV(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const savedCV = await employerService.saveCV(req.user.id, id);

    const response: ApiResponse = {
      success: true,
      message: "CV saved successfully. This snapshot will be preserved.",
      data: {
        savedCV: {
          id: savedCV.id,
          version: savedCV.version,
          savedAt: savedCV.savedAt,
        },
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /employer/saved
 * Get saved CV snapshots
 */
export async function getSavedCVs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const pagination: PaginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit
        ? Math.min(parseInt(req.query.limit as string, 10), config.pagination.maxLimit)
        : config.pagination.defaultLimit,
    };

    const result = await employerService.getSavedCVs(req.user.id, pagination);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /employer/saved/:id
 * Get specific saved CV snapshot
 */
export async function getSavedCV(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const savedCV = await employerService.getSavedCV(req.user.id, id);

    const response: ApiResponse = {
      success: true,
      data: { savedCV },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /employer/saved/:id
 * Delete saved CV snapshot
 */
export async function deleteSavedCV(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    await employerService.deleteSavedCV(req.user.id, id);

    const response: ApiResponse = {
      success: true,
      message: "Saved CV deleted successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
