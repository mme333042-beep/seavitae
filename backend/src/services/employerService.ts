/**
 * SeaVitae Employer Service
 * Handles employer profiles, CV search, and saved CVs
 */

import { PrismaClient, Prisma } from "@prisma/client";
import {
  CreateEmployerProfileInput,
  UpdateEmployerProfileInput,
  CVSearchFilters,
  PaginationParams,
  PaginatedResult,
  CVSnapshotData,
} from "../types";
import { NotFoundError, BadRequestError, ForbiddenError } from "../utils/errors";

const prisma = new PrismaClient();

// Include all relations when fetching CV profiles
const cvProfileInclude = {
  skills: true,
  experiences: { orderBy: { order: "asc" as const } },
  education: { orderBy: { order: "asc" as const } },
  languages: true,
  certifications: true,
  projects: true,
  publications: true,
};

/**
 * Get employer profile by user ID
 */
export async function getEmployerProfileByUserId(userId: string) {
  return prisma.employerProfile.findUnique({
    where: { userId },
  });
}

/**
 * Get employer profile by profile ID
 */
export async function getEmployerProfileById(profileId: string) {
  return prisma.employerProfile.findUnique({
    where: { id: profileId },
  });
}

/**
 * Create employer profile
 */
export async function createEmployerProfile(
  userId: string,
  input: CreateEmployerProfileInput
) {
  // Check if profile already exists
  const existing = await prisma.employerProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new BadRequestError("Employer profile already exists");
  }

  return prisma.employerProfile.create({
    data: {
      userId,
      type: input.type,
      displayName: input.displayName,
      city: input.city,
      companyName: input.companyName,
      website: input.website,
      contactPersonName: input.contactPersonName,
      contactPersonRole: input.contactPersonRole,
      linkedIn: input.linkedIn,
      isVerified: false,
    },
  });
}

/**
 * Update employer profile
 */
export async function updateEmployerProfile(
  userId: string,
  input: UpdateEmployerProfileInput
) {
  const profile = await prisma.employerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new NotFoundError("Employer profile not found");
  }

  return prisma.employerProfile.update({
    where: { id: profile.id },
    data: {
      displayName: input.displayName ?? profile.displayName,
      city: input.city ?? profile.city,
      companyName: input.companyName ?? profile.companyName,
      website: input.website ?? profile.website,
      contactPersonName: input.contactPersonName ?? profile.contactPersonName,
      contactPersonRole: input.contactPersonRole ?? profile.contactPersonRole,
      linkedIn: input.linkedIn ?? profile.linkedIn,
    },
  });
}

/**
 * Search visible CV profiles with filters
 */
export async function searchCVs(
  filters: CVSearchFilters,
  pagination: PaginationParams
): Promise<PaginatedResult<unknown>> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.JobseekerProfileWhereInput = {
    isVisible: true, // Only show visible profiles
  };

  // City filter
  if (filters.city) {
    where.city = {
      contains: filters.city,
    };
  }

  // Years of experience filter
  if (filters.yearsExperienceMin !== undefined || filters.yearsExperienceMax !== undefined) {
    where.yearsExperience = {};
    if (filters.yearsExperienceMin !== undefined) {
      where.yearsExperience.gte = filters.yearsExperienceMin;
    }
    if (filters.yearsExperienceMax !== undefined) {
      where.yearsExperience.lte = filters.yearsExperienceMax;
    }
  }

  // Age filter (hidden from display but used for filtering)
  if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
    where.age = {};
    if (filters.ageMin !== undefined) {
      where.age.gte = filters.ageMin;
    }
    if (filters.ageMax !== undefined) {
      where.age.lte = filters.ageMax;
    }
  }

  // Skills filter
  if (filters.skills && filters.skills.length > 0) {
    where.skills = {
      some: {
        name: {
          in: filters.skills,
        },
      },
    };
  }

  // Keyword search (searches in name, role, bio, skills)
  if (filters.keywords) {
    const keywordFilter = filters.keywords.toLowerCase();
    where.OR = [
      { fullName: { contains: keywordFilter } },
      { preferredRole: { contains: keywordFilter } },
      { bio: { contains: keywordFilter } },
      { skills: { some: { name: { contains: keywordFilter } } } },
    ];
  }

  // Execute count and find in parallel
  const [total, profiles] = await Promise.all([
    prisma.jobseekerProfile.count({ where }),
    prisma.jobseekerProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { lastUpdated: "desc" },
      include: {
        skills: true,
        experiences: {
          orderBy: { order: "asc" },
          take: 1, // Only get latest experience for preview
        },
      },
    }),
  ]);

  // Transform to hide sensitive data (age)
  const sanitizedProfiles = profiles.map((profile) => ({
    id: profile.id,
    fullName: profile.fullName,
    city: profile.city,
    preferredRole: profile.preferredRole,
    bio: profile.bio.substring(0, 200) + (profile.bio.length > 200 ? "..." : ""),
    yearsExperience: profile.yearsExperience,
    skills: profile.skills.map((s) => s.name),
    currentPosition: profile.experiences[0] || null,
    lastUpdated: profile.lastUpdated,
  }));

  return {
    data: sanitizedProfiles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get full CV profile for employer viewing
 * Note: Age is excluded from the returned data
 */
export async function getFullCVProfile(profileId: string) {
  const profile = await prisma.jobseekerProfile.findUnique({
    where: { id: profileId },
    include: cvProfileInclude,
  });

  if (!profile) {
    throw new NotFoundError("CV not found");
  }

  if (!profile.isVisible) {
    throw new ForbiddenError("This CV is not currently visible");
  }

  // Return profile without age (sensitive data)
  const { age, userId, ...publicProfile } = profile;

  return {
    ...publicProfile,
    skills: profile.skills.map((s) => s.name),
  };
}

/**
 * Save CV snapshot for employer
 */
export async function saveCV(employerUserId: string, jobseekerProfileId: string) {
  // Get employer profile
  const employerProfile = await prisma.employerProfile.findUnique({
    where: { userId: employerUserId },
  });

  if (!employerProfile) {
    throw new NotFoundError("Employer profile not found");
  }

  // Get jobseeker profile
  const cvProfile = await prisma.jobseekerProfile.findUnique({
    where: { id: jobseekerProfileId },
    include: cvProfileInclude,
  });

  if (!cvProfile) {
    throw new NotFoundError("CV not found");
  }

  if (!cvProfile.isVisible) {
    throw new ForbiddenError("This CV is not currently visible");
  }

  // Get current version count
  const existingSnapshots = await prisma.savedCV.count({
    where: {
      employerProfileId: employerProfile.id,
      jobseekerProfileId: cvProfile.id,
    },
  });

  // Create snapshot data
  const snapshotData: CVSnapshotData = {
    fullName: cvProfile.fullName,
    city: cvProfile.city,
    preferredRole: cvProfile.preferredRole,
    bio: cvProfile.bio,
    yearsExperience: cvProfile.yearsExperience,
    skills: cvProfile.skills.map((s) => s.name),
    experiences: cvProfile.experiences.map((exp) => ({
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate?.toISOString() || null,
      description: exp.description,
    })),
    education: cvProfile.education.map((edu) => ({
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location,
      graduationYear: edu.graduationYear,
    })),
    languages: cvProfile.languages.map((lang) => ({
      name: lang.name,
      proficiency: lang.proficiency,
    })),
    certifications: cvProfile.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      year: cert.year,
    })),
    projects: cvProfile.projects.map((proj) => ({
      name: proj.name,
      description: proj.description,
      link: proj.link,
    })),
    publications: cvProfile.publications.map((pub) => ({
      title: pub.title,
      venue: pub.venue,
      link: pub.link,
    })),
    savedAt: new Date().toISOString(),
  };

  // Create saved CV record
  return prisma.savedCV.create({
    data: {
      employerProfileId: employerProfile.id,
      jobseekerProfileId: cvProfile.id,
      version: existingSnapshots + 1,
      snapshotData: JSON.stringify(snapshotData),
    },
  });
}

/**
 * Get saved CVs for employer
 */
export async function getSavedCVs(
  employerUserId: string,
  pagination: PaginationParams
): Promise<PaginatedResult<unknown>> {
  const employerProfile = await prisma.employerProfile.findUnique({
    where: { userId: employerUserId },
  });

  if (!employerProfile) {
    throw new NotFoundError("Employer profile not found");
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [total, savedCVs] = await Promise.all([
    prisma.savedCV.count({
      where: { employerProfileId: employerProfile.id },
    }),
    prisma.savedCV.findMany({
      where: { employerProfileId: employerProfile.id },
      skip,
      take: limit,
      orderBy: { savedAt: "desc" },
      include: {
        jobseekerProfile: {
          select: {
            id: true,
            isVisible: true,
          },
        },
      },
    }),
  ]);

  return {
    data: savedCVs.map((cv) => ({
      id: cv.id,
      version: cv.version,
      savedAt: cv.savedAt,
      snapshotData: cv.snapshotData,
      currentProfileId: cv.jobseekerProfile.id,
      isCurrentlyVisible: cv.jobseekerProfile.isVisible,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a specific saved CV snapshot
 */
export async function getSavedCV(employerUserId: string, savedCVId: string) {
  const employerProfile = await prisma.employerProfile.findUnique({
    where: { userId: employerUserId },
  });

  if (!employerProfile) {
    throw new NotFoundError("Employer profile not found");
  }

  const savedCV = await prisma.savedCV.findUnique({
    where: { id: savedCVId },
  });

  if (!savedCV || savedCV.employerProfileId !== employerProfile.id) {
    throw new NotFoundError("Saved CV not found");
  }

  return {
    id: savedCV.id,
    version: savedCV.version,
    savedAt: savedCV.savedAt,
    snapshotData: savedCV.snapshotData,
  };
}

/**
 * Delete a saved CV
 */
export async function deleteSavedCV(employerUserId: string, savedCVId: string) {
  const employerProfile = await prisma.employerProfile.findUnique({
    where: { userId: employerUserId },
  });

  if (!employerProfile) {
    throw new NotFoundError("Employer profile not found");
  }

  const savedCV = await prisma.savedCV.findUnique({
    where: { id: savedCVId },
  });

  if (!savedCV || savedCV.employerProfileId !== employerProfile.id) {
    throw new NotFoundError("Saved CV not found");
  }

  await prisma.savedCV.delete({
    where: { id: savedCVId },
  });
}
