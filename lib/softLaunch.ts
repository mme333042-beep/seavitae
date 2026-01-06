/**
 * SeaVitae Soft Launch Configuration
 *
 * Controls the soft launch phase settings and access restrictions.
 * For the first 2-4 weeks, access is limited to invited users only.
 */

export type LaunchPhase = "soft_launch" | "beta" | "public";

export interface SoftLaunchConfig {
  phase: LaunchPhase;
  inviteOnly: boolean;
  maxUsers: number;
  feedbackEnabled: boolean;
  analyticsEnabled: boolean;
  startDate: Date;
  plannedPublicDate: Date | null;
}

// Current soft launch configuration
export const SOFT_LAUNCH_CONFIG: SoftLaunchConfig = {
  phase: "soft_launch",
  inviteOnly: true,
  maxUsers: 100, // Small, controlled group
  feedbackEnabled: true,
  analyticsEnabled: true,
  startDate: new Date("2025-01-06"),
  plannedPublicDate: null, // To be determined based on feedback
};

/**
 * Check if the platform is in soft launch mode
 */
export function isSoftLaunch(): boolean {
  return SOFT_LAUNCH_CONFIG.phase === "soft_launch";
}

/**
 * Check if invite-only access is enabled
 */
export function isInviteOnly(): boolean {
  return SOFT_LAUNCH_CONFIG.inviteOnly;
}

/**
 * Check if feedback collection is enabled
 */
export function isFeedbackEnabled(): boolean {
  return SOFT_LAUNCH_CONFIG.feedbackEnabled;
}

/**
 * Check if analytics tracking is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return SOFT_LAUNCH_CONFIG.analyticsEnabled;
}

/**
 * Get the current launch phase label for display
 */
export function getLaunchPhaseLabel(): string {
  switch (SOFT_LAUNCH_CONFIG.phase) {
    case "soft_launch":
      return "Early Access";
    case "beta":
      return "Beta";
    case "public":
      return "";
    default:
      return "";
  }
}

/**
 * Get days since soft launch started
 */
export function getDaysSinceLaunch(): number {
  const now = new Date();
  const diff = now.getTime() - SOFT_LAUNCH_CONFIG.startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if we're within the initial soft launch window (2-4 weeks)
 */
export function isWithinSoftLaunchWindow(): boolean {
  const days = getDaysSinceLaunch();
  return days <= 28; // 4 weeks
}
