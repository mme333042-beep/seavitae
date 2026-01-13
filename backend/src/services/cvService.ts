/**
 * SeaVitae CV Service
 * Handles CV creation, updates, and retrieval for jobseekers
 */

import { PrismaClient, JobseekerProfile, Prisma } from "@prisma/client";
import {
  CreateJobseekerProfileInput,
  UpdateJobseekerProfileInput,
} from "../types";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/errors";

const prisma = new PrismaClient();

// Include all relations when fetching profiles
const fullProfileInclude = {
  skills: true,
  experiences: { orderBy: { order: "asc" as const } },
  education: { orderBy: { order: "asc" as const } },
  languages: true,
  certifications: true,
  projects: true,
  publications: true,
};

/**
 * Get jobseeker profile by user ID
 */
export async function getProfileByUserId(userId: string) {
  return prisma.jobseekerProfile.findUnique({
    where: { userId },
    include: fullProfileInclude,
  });
}

/**
 * Get jobseeker profile by profile ID
 */
export async function getProfileById(profileId: string) {
  return prisma.jobseekerProfile.findUnique({
    where: { id: profileId },
    include: fullProfileInclude,
  });
}

/**
 * Check if profile is editable (visibility is OFF)
 */
function assertProfileEditable(profile: JobseekerProfile): void {
  if (profile.isVisible) {
    throw new ForbiddenError(
      "CV is locked while visible to employers. Turn off visibility to edit."
    );
  }
}

/**
 * Create a new jobseeker profile
 */
export async function createProfile(
  userId: string,
  input: CreateJobseekerProfileInput
) {
  // Check if profile already exists
  const existing = await prisma.jobseekerProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new BadRequestError("Profile already exists");
  }

  // Create profile with all relations in a transaction
  return prisma.$transaction(async (tx) => {
    const profile = await tx.jobseekerProfile.create({
      data: {
        userId,
        fullName: input.fullName,
        city: input.city,
        preferredRole: input.preferredRole,
        bio: input.bio,
        age: input.age,
        yearsExperience: input.yearsExperience,
        isVisible: false,
        lastUpdated: new Date(),
      },
    });

    // Create skills
    if (input.skills.length > 0) {
      await tx.skill.createMany({
        data: input.skills.map((name) => ({
          jobseekerProfileId: profile.id,
          name: name.trim(),
        })),
      });
    }

    // Create experiences
    if (input.experiences.length > 0) {
      await tx.experience.createMany({
        data: input.experiences.map((exp, index) => ({
          jobseekerProfileId: profile.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          description: exp.description,
          order: exp.order ?? index,
        })),
      });
    }

    // Create education
    if (input.education.length > 0) {
      await tx.education.createMany({
        data: input.education.map((edu, index) => ({
          jobseekerProfileId: profile.id,
          degree: edu.degree,
          institution: edu.institution,
          location: edu.location,
          graduationYear: edu.graduationYear,
          order: edu.order ?? index,
        })),
      });
    }

    // Create languages
    if (input.languages && input.languages.length > 0) {
      await tx.language.createMany({
        data: input.languages.map((lang) => ({
          jobseekerProfileId: profile.id,
          name: lang.name,
          proficiency: lang.proficiency,
        })),
      });
    }

    // Create certifications
    if (input.certifications && input.certifications.length > 0) {
      await tx.certification.createMany({
        data: input.certifications.map((cert) => ({
          jobseekerProfileId: profile.id,
          name: cert.name,
          issuer: cert.issuer,
          year: cert.year,
        })),
      });
    }

    // Create projects
    if (input.projects && input.projects.length > 0) {
      await tx.project.createMany({
        data: input.projects.map((proj) => ({
          jobseekerProfileId: profile.id,
          name: proj.name,
          description: proj.description,
          link: proj.link || null,
        })),
      });
    }

    // Create publications
    if (input.publications && input.publications.length > 0) {
      await tx.publication.createMany({
        data: input.publications.map((pub) => ({
          jobseekerProfileId: profile.id,
          title: pub.title,
          venue: pub.venue,
          link: pub.link || null,
        })),
      });
    }

    // Return full profile with relations
    return tx.jobseekerProfile.findUnique({
      where: { id: profile.id },
      include: fullProfileInclude,
    });
  });
}

/**
 * Update jobseeker profile
 */
export async function updateProfile(
  userId: string,
  input: UpdateJobseekerProfileInput
) {
  const profile = await prisma.jobseekerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  // Check if profile is editable
  assertProfileEditable(profile);

  return prisma.$transaction(async (tx) => {
    // Update basic fields
    const updateData: Prisma.JobseekerProfileUpdateInput = {
      lastUpdated: new Date(),
    };

    if (input.fullName !== undefined) updateData.fullName = input.fullName;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.preferredRole !== undefined) updateData.preferredRole = input.preferredRole;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.age !== undefined) updateData.age = input.age;
    if (input.yearsExperience !== undefined) updateData.yearsExperience = input.yearsExperience;

    await tx.jobseekerProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    // Update skills (replace all)
    if (input.skills !== undefined) {
      await tx.skill.deleteMany({ where: { jobseekerProfileId: profile.id } });
      if (input.skills.length > 0) {
        await tx.skill.createMany({
          data: input.skills.map((name) => ({
            jobseekerProfileId: profile.id,
            name: name.trim(),
          })),
        });
      }
    }

    // Update experiences (replace all)
    if (input.experiences !== undefined) {
      await tx.experience.deleteMany({ where: { jobseekerProfileId: profile.id } });
      if (input.experiences.length > 0) {
        await tx.experience.createMany({
          data: input.experiences.map((exp, index) => ({
            jobseekerProfileId: profile.id,
            title: exp.title,
            company: exp.company,
            location: exp.location,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            description: exp.description,
            order: exp.order ?? index,
          })),
        });
      }
    }

    // Update education (replace all)
    if (input.education !== undefined) {
      await tx.education.deleteMany({ where: { jobseekerProfileId: profile.id } });
      if (input.education.length > 0) {
        await tx.education.createMany({
          data: input.education.map((edu, index) => ({
            jobseekerProfileId: profile.id,
            degree: edu.degree,
            institution: edu.institution,
            location: edu.location,
            graduationYear: edu.graduationYear,
            order: edu.order ?? index,
          })),
        });
      }
    }

    // Update languages (replace all)
    if (input.languages !== undefined) {
      await tx.language.deleteMany({ where: { jobseekerProfileId: profile.id } });
      if (input.languages.length > 0) {
        await tx.language.createMany({
          data: input.languages.map((lang) => ({
            jobseekerProfileId: profile.id,
            name: lang.name,
            proficiency: lang.proficiency,
          })),
        });
      }
    }

    // Update certifications (replace all)
    if (input.certifications !== undefined) {
      await tx.certification.deleteMany({ where: { jobseekerProfileId: profile.id } });
      if (input.certifications.length > 0) {
        await tx.certification.createMany({
          data: input.certifications.map((cert) => ({
            jobseekerProfileId: profile.id,
            name: cert.name,
            issuer: cert.issuer,
            year: cert.year,
          })),
        });
      }
    }

    // Update projects (replace all)
    if (input.projects !== undefined) {
      await tx.project.deleteMany({ where: { jobseekerProfileId: profile.id } });
      if (input.projects.length > 0) {
        await tx.project.createMany({
          data: input.projects.map((proj) => ({
            jobseekerProfileId: profile.id,
            name: proj.name,
            description: proj.description,
            link: proj.link || null,
          })),
        });
      }
    }

    // Update publications (replace all)
    if (input.publications !== undefined) {
      await tx.publication.deleteMany({ where: { jobseekerProfileId: profile.id } });
      if (input.publications.length > 0) {
        await tx.publication.createMany({
          data: input.publications.map((pub) => ({
            jobseekerProfileId: profile.id,
            title: pub.title,
            venue: pub.venue,
            link: pub.link || null,
          })),
        });
      }
    }

    // Return updated profile
    return tx.jobseekerProfile.findUnique({
      where: { id: profile.id },
      include: fullProfileInclude,
    });
  });
}

/**
 * Toggle profile visibility
 */
export async function toggleVisibility(userId: string, isVisible: boolean) {
  const profile = await prisma.jobseekerProfile.findUnique({
    where: { userId },
    include: fullProfileInclude,
  });

  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  // Validate profile has required sections before making visible
  if (isVisible) {
    const errors: string[] = [];
    if (!profile.bio || profile.bio.length < 50) {
      errors.push("Professional summary must be at least 50 characters");
    }
    if (!profile.skills || profile.skills.length === 0) {
      errors.push("At least one skill is required");
    }
    if (!profile.experiences || profile.experiences.length === 0) {
      errors.push("At least one experience entry is required");
    }
    if (!profile.education || profile.education.length === 0) {
      errors.push("At least one education entry is required");
    }

    if (errors.length > 0) {
      throw new BadRequestError("Profile is incomplete", errors);
    }
  }

  return prisma.jobseekerProfile.update({
    where: { id: profile.id },
    data: { isVisible },
    include: fullProfileInclude,
  });
}

/**
 * Get visibility status
 */
export async function getVisibilityStatus(userId: string) {
  const profile = await prisma.jobseekerProfile.findUnique({
    where: { userId },
    select: { isVisible: true },
  });

  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  return profile.isVisible;
}
