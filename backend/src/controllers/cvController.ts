/**
 * SeaVitae CV Controller
 * Handles HTTP requests for jobseeker CV/profile endpoints
 */

import { Response, NextFunction } from "express";
import * as cvService from "../services/cvService";
import { generateCVPDF } from "../services/pdfService";
import { AuthenticatedRequest, ApiResponse } from "../types";
import { NotFoundError } from "../utils/errors";

/**
 * GET /cv/profile
 * Get current user's CV profile
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

    const profile = await cvService.getProfileByUserId(req.user.id);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Profile not found. Please create your CV.",
      });
      return;
    }

    // Transform skills array
    const transformedProfile = {
      ...profile,
      skills: profile.skills.map((s) => s.name),
    };

    const response: ApiResponse = {
      success: true,
      data: { profile: transformedProfile },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /cv/profile
 * Create CV profile
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

    const profile = await cvService.createProfile(req.user.id, req.body);

    if (!profile) {
      throw new Error("Failed to create profile");
    }

    // Transform skills array
    const transformedProfile = {
      ...profile,
      skills: profile.skills.map((s) => s.name),
    };

    const response: ApiResponse = {
      success: true,
      message: "CV created successfully",
      data: { profile: transformedProfile },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /cv/profile
 * Update CV profile
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

    const profile = await cvService.updateProfile(req.user.id, req.body);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Transform skills array
    const transformedProfile = {
      ...profile,
      skills: profile.skills.map((s) => s.name),
    };

    const response: ApiResponse = {
      success: true,
      message: "CV updated successfully",
      data: { profile: transformedProfile },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /cv/visibility
 * Toggle CV visibility
 */
export async function toggleVisibility(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { isVisible } = req.body;
    const profile = await cvService.toggleVisibility(req.user.id, isVisible);

    const response: ApiResponse = {
      success: true,
      message: isVisible
        ? "CV is now visible to employers. Editing is locked."
        : "CV is now hidden. You can edit your CV.",
      data: {
        isVisible: profile.isVisible,
        isLocked: profile.isVisible,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /cv/visibility
 * Get visibility status
 */
export async function getVisibility(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const isVisible = await cvService.getVisibilityStatus(req.user.id);

    const response: ApiResponse = {
      success: true,
      data: {
        isVisible,
        isLocked: isVisible,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /cv/download
 * Download CV as PDF (jobseeker only)
 */
export async function downloadPDF(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const profile = await cvService.getProfileByUserId(req.user.id);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Profile not found. Please create your CV first.",
      });
      return;
    }

    // Prepare data for PDF
    const pdfData = {
      fullName: profile.fullName,
      city: profile.city,
      preferredRole: profile.preferredRole,
      bio: profile.bio,
      skills: profile.skills.map((s) => s.name),
      experiences: profile.experiences.map((exp) => ({
        title: exp.title,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
      })),
      education: profile.education.map((edu) => ({
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location,
        graduationYear: edu.graduationYear,
      })),
      languages: profile.languages.map((lang) => ({
        name: lang.name,
        proficiency: lang.proficiency,
      })),
      certifications: profile.certifications.map((cert) => ({
        name: cert.name,
        issuer: cert.issuer,
        year: cert.year,
      })),
      projects: profile.projects.map((proj) => ({
        name: proj.name,
        description: proj.description,
        link: proj.link,
      })),
      publications: profile.publications.map((pub) => ({
        title: pub.title,
        venue: pub.venue,
        link: pub.link,
      })),
    };

    // Generate PDF
    const pdfBuffer = await generateCVPDF(pdfData);

    // Set response headers for PDF download
    const filename = `${profile.fullName.replace(/\s+/g, "_")}_CV.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
