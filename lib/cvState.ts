/**
 * CV State Management
 * Handles CV states (Draft/Active) and visibility-based locking
 * CV is locked when visibility is ON, editable when visibility is OFF
 */

export type CVState = "draft" | "active";

export interface CVStateInfo {
  state: CVState;
  lastUpdated: Date;
  isVisible: boolean;
}

export interface CVSnapshot {
  id: string;
  cvId: string;
  savedAt: Date;
  savedByEmployerId: string;
  version: number;
  data: CVSnapshotData;
}

export interface CVSnapshotData {
  fullName: string;
  city: string;
  preferredRole: string;
  bio: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  languages: LanguageEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  publications: PublicationEntry[];
  lastUpdated: Date;
  yearsOfExperience?: number;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location: string;
  year: number;
}

export interface LanguageEntry {
  language: string;
  proficiency: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  year: number;
}

export interface ProjectEntry {
  name: string;
  description: string;
  link: string;
}

export interface PublicationEntry {
  title: string;
  venue: string;
  link: string;
}

// In-memory storage for CV state
const cvStates: Map<string, CVStateInfo> = new Map();

// In-memory storage for CV snapshots
const cvSnapshots: CVSnapshot[] = [];

/**
 * Initialize CV state for a new CV
 */
export function initializeCVState(cvId: string): CVStateInfo {
  const stateInfo: CVStateInfo = {
    state: "draft",
    lastUpdated: new Date(),
    isVisible: false,
  };
  cvStates.set(cvId, stateInfo);
  return stateInfo;
}

/**
 * Get CV state info
 */
export function getCVState(cvId: string): CVStateInfo | null {
  return cvStates.get(cvId) || null;
}

/**
 * Set CV visibility (and lock status)
 * CV is locked when visibility is ON, editable when OFF
 */
export function setCVVisibility(cvId: string, isVisible: boolean): CVStateInfo {
  const existing = cvStates.get(cvId);

  const stateInfo: CVStateInfo = {
    state: isVisible ? "active" : "draft",
    lastUpdated: existing?.lastUpdated || new Date(),
    isVisible: isVisible,
  };
  cvStates.set(cvId, stateInfo);
  return stateInfo;
}

/**
 * Check if CV editing is currently locked
 * CV is locked only when visibility is ON
 */
export function isEditLocked(cvId: string): boolean {
  const stateInfo = cvStates.get(cvId);
  if (!stateInfo) {
    return false;
  }
  return stateInfo.isVisible;
}

/**
 * Get edit lock message for display
 */
export function getEditLockMessage(cvId: string): string | null {
  if (!isEditLocked(cvId)) {
    return null;
  }
  return "Your CV is locked while visible to employers. Turn off visibility to edit.";
}

/**
 * Update CV last modified date (only if not locked)
 */
export function updateCVTimestamp(cvId: string): boolean {
  if (isEditLocked(cvId)) {
    return false;
  }

  const existing = cvStates.get(cvId);
  if (existing) {
    existing.lastUpdated = new Date();
    cvStates.set(cvId, existing);
  }
  return true;
}

/**
 * Format last updated date for display
 */
export function formatLastUpdated(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

/**
 * Create a snapshot of a CV when an employer saves it
 */
export function createCVSnapshot(
  cvId: string,
  employerId: string,
  cvData: CVSnapshotData
): CVSnapshot {
  const existingSnapshots = cvSnapshots.filter(
    (s) => s.cvId === cvId && s.savedByEmployerId === employerId
  );
  const version = existingSnapshots.length + 1;

  const snapshot: CVSnapshot = {
    id: `snapshot-${cvId}-${employerId}-${version}`,
    cvId,
    savedAt: new Date(),
    savedByEmployerId: employerId,
    version,
    data: { ...cvData },
  };

  cvSnapshots.push(snapshot);
  return snapshot;
}

/**
 * Get all snapshots saved by an employer
 */
export function getEmployerSnapshots(employerId: string): CVSnapshot[] {
  return cvSnapshots
    .filter((s) => s.savedByEmployerId === employerId)
    .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
}

/**
 * Get CV state display label
 */
export function getCVStateLabel(state: CVState): string {
  switch (state) {
    case "draft":
      return "Draft";
    case "active":
      return "Active";
    default:
      return "Unknown";
  }
}

/**
 * Get CV state description
 */
export function getCVStateDescription(state: CVState): string {
  switch (state) {
    case "draft":
      return "Your CV is not visible to employers.";
    case "active":
      return "Your CV is visible to employers in search results.";
    default:
      return "";
  }
}
