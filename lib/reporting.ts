/**
 * SeaVitae Reporting System (V1)
 *
 * Basic abuse reporting for CV profiles and employer profiles.
 * No automatic bans or enforcement - reports are collected for review.
 */

export type ReportTargetType = "cv_profile" | "employer_profile";

export type ReportReason =
  | "spam"
  | "fake_profile"
  | "inappropriate_content"
  | "harassment"
  | "misleading_information"
  | "other";

export interface ReportReasonOption {
  value: ReportReason;
  label: string;
  description: string;
}

// Report reason options for UI
export const REPORT_REASONS: ReportReasonOption[] = [
  {
    value: "spam",
    label: "Spam",
    description: "Profile appears to be spam or automated",
  },
  {
    value: "fake_profile",
    label: "Fake or impersonation",
    description: "Profile appears to be fake or impersonating someone",
  },
  {
    value: "inappropriate_content",
    label: "Inappropriate content",
    description: "Profile contains inappropriate or offensive content",
  },
  {
    value: "harassment",
    label: "Harassment",
    description: "User engaged in harassing or threatening behavior",
  },
  {
    value: "misleading_information",
    label: "Misleading information",
    description: "Profile contains false or misleading information",
  },
  {
    value: "other",
    label: "Other",
    description: "Another issue not listed above",
  },
];

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reporterId: string;
  reason: ReportReason;
  note?: string;
  createdAt: Date;
  status: "pending" | "reviewed" | "dismissed";
}

/**
 * Validate a report before submission
 */
export function validateReport(
  reason: ReportReason | "",
  note: string
): { valid: boolean; error?: string } {
  if (!reason) {
    return { valid: false, error: "Please select a reason for your report." };
  }

  if (reason === "other" && !note.trim()) {
    return {
      valid: false,
      error: "Please provide details when selecting 'Other'.",
    };
  }

  if (note.length > 500) {
    return { valid: false, error: "Note cannot exceed 500 characters." };
  }

  return { valid: true };
}

/**
 * Get the label for a report reason
 */
export function getReasonLabel(reason: ReportReason): string {
  const option = REPORT_REASONS.find((r) => r.value === reason);
  return option?.label || reason;
}

/**
 * Get the target type label for display
 */
export function getTargetTypeLabel(type: ReportTargetType): string {
  switch (type) {
    case "cv_profile":
      return "CV Profile";
    case "employer_profile":
      return "Employer Profile";
    default:
      return "Profile";
  }
}
