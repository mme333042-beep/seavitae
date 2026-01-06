/**
 * SeaVitae Employer Verification Logic
 *
 * This is trust signaling, not official certification or KYC.
 * Unverified employers can still use the platform.
 */

export type EmployerType = "company" | "individual";

export interface EmployerProfile {
  id: string;
  type: EmployerType;
  name: string;
  city: string;
  // Company-specific fields
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  registrationNumber?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  // Individual-specific fields
  profession?: string;
  linkedIn?: string;
  hiringReason?: string;
  // Verification tracking
  emailVerified?: boolean;
  detailsCompleted?: boolean;
  createdAt: Date;
}

export interface VerificationStatus {
  hasVerifiedDetails: boolean;
  completionPercentage: number;
  missingFields: string[];
}

/**
 * Check verification status for a company employer
 */
function checkCompanyVerification(employer: EmployerProfile): VerificationStatus {
  const requiredFields = [
    { key: "companyName", label: "Company name" },
    { key: "industry", label: "Industry" },
    { key: "city", label: "City" },
    { key: "contactPersonName", label: "Contact person name" },
  ];

  const optionalFields = [
    { key: "companySize", label: "Company size" },
    { key: "website", label: "Website" },
    { key: "registrationNumber", label: "Registration number" },
    { key: "contactPersonRole", label: "Contact person role" },
  ];

  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const field of requiredFields) {
    if (!employer[field.key as keyof EmployerProfile]) {
      missingRequired.push(field.label);
    }
  }

  for (const field of optionalFields) {
    if (!employer[field.key as keyof EmployerProfile]) {
      missingOptional.push(field.label);
    }
  }

  const totalFields = requiredFields.length + optionalFields.length;
  const completedFields =
    totalFields - missingRequired.length - missingOptional.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  // Verified details requires all required fields completed
  const hasVerifiedDetails = missingRequired.length === 0;

  return {
    hasVerifiedDetails,
    completionPercentage,
    missingFields: missingRequired,
  };
}

/**
 * Check verification status for an individual employer
 */
function checkIndividualVerification(
  employer: EmployerProfile
): VerificationStatus {
  const requiredFields = [
    { key: "name", label: "Full name" },
    { key: "city", label: "City" },
    { key: "profession", label: "Profession" },
  ];

  const optionalFields = [
    { key: "linkedIn", label: "LinkedIn profile" },
    { key: "hiringReason", label: "Hiring reason" },
  ];

  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const field of requiredFields) {
    if (!employer[field.key as keyof EmployerProfile]) {
      missingRequired.push(field.label);
    }
  }

  for (const field of optionalFields) {
    if (!employer[field.key as keyof EmployerProfile]) {
      missingOptional.push(field.label);
    }
  }

  const totalFields = requiredFields.length + optionalFields.length;
  const completedFields =
    totalFields - missingRequired.length - missingOptional.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const hasVerifiedDetails = missingRequired.length === 0;

  return {
    hasVerifiedDetails,
    completionPercentage,
    missingFields: missingRequired,
  };
}

/**
 * Get verification status for any employer
 */
export function getVerificationStatus(
  employer: EmployerProfile
): VerificationStatus {
  if (employer.type === "company") {
    return checkCompanyVerification(employer);
  }
  return checkIndividualVerification(employer);
}

/**
 * Get the display name for an employer
 */
export function getEmployerDisplayName(employer: EmployerProfile): string {
  if (employer.type === "company") {
    return employer.companyName || employer.name;
  }
  return employer.name;
}

/**
 * Get the employer type label for display
 */
export function getEmployerTypeLabel(type: EmployerType): string {
  return type === "company" ? "Company" : "Individual";
}

/**
 * Get the industry or category for display
 */
export function getEmployerCategory(employer: EmployerProfile): string {
  if (employer.type === "company") {
    return employer.industry || "Industry not specified";
  }
  return employer.profession || "Profession not specified";
}
