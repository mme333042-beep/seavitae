export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  hasDesiredRole: boolean;
  hasCity: boolean;
  isOpenToDiscovery: boolean;
  isDiscoverable: boolean;
}

export interface JobseekerProfile {
  fullName?: string;
  city?: string;
  preferredRole?: string;
  bio?: string;
  hasExperience?: boolean;
  hasSkills?: boolean;
  isOpenToDiscovery?: boolean;
}

export function checkProfileCompletion(
  profile: JobseekerProfile
): ProfileCompletionStatus {
  const missingFields: string[] = [];

  if (!profile.fullName) {
    missingFields.push("Full name");
  }

  if (!profile.city) {
    missingFields.push("City");
  }

  if (!profile.preferredRole) {
    missingFields.push("Preferred job role");
  }

  if (!profile.bio) {
    missingFields.push("Professional summary");
  }

  if (!profile.hasSkills) {
    missingFields.push("At least one skill");
  }

  const hasDesiredRole = Boolean(profile.preferredRole);
  const hasCity = Boolean(profile.city);
  const isComplete = missingFields.length === 0;
  const isOpenToDiscovery = Boolean(profile.isOpenToDiscovery);

  const isDiscoverable = isComplete && hasDesiredRole && hasCity && isOpenToDiscovery;

  return {
    isComplete,
    missingFields,
    hasDesiredRole,
    hasCity,
    isOpenToDiscovery,
    isDiscoverable,
  };
}

export function getVisibilityMessage(status: ProfileCompletionStatus): string {
  if (status.isDiscoverable) {
    return "Your profile is visible to employers.";
  }

  const reasons: string[] = [];

  if (!status.isOpenToDiscovery) {
    reasons.push("Discovery is turned off in your settings");
  }

  if (!status.isComplete) {
    reasons.push(`Missing required fields: ${status.missingFields.join(", ")}`);
  }

  if (!status.hasDesiredRole) {
    reasons.push("Preferred job role is not set");
  }

  if (!status.hasCity) {
    reasons.push("City is not set");
  }

  return `Your profile is not visible to employers. ${reasons.join(". ")}.`;
}
