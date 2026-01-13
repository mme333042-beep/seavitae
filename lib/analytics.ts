/**
 * SeaVitae Analytics Tracking (Soft Launch)
 *
 * Tracks key user actions during the soft launch phase.
 * This is client-side tracking for V1 - production would use a proper analytics service.
 */

import { isAnalyticsEnabled } from "./softLaunch";

export type AnalyticsEvent =
  | "sign_up"
  | "sign_in"
  | "cv_created"
  | "cv_updated"
  | "cv_visibility_changed"
  | "search_performed"
  | "cv_viewed"
  | "interview_requested"
  | "interview_accepted"
  | "interview_declined"
  | "message_sent"
  | "message_read"
  | "invite_sent"
  | "invite_link_copied"
  | "invite_created"
  | "invite_code_copied"
  | "profile_completed"
  | "feedback_submitted";

export type UserRole = "jobseeker" | "employer" | "unknown";

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  userId?: string;
  userRole?: UserRole;
  timestamp: Date;
  metadata?: Record<string, string | number | boolean>;
}

// In-memory storage for soft launch - production would use persistent storage
let eventLog: AnalyticsEventData[] = [];

/**
 * Track an analytics event
 */
export function trackEvent(
  event: AnalyticsEvent,
  options?: {
    userId?: string;
    userRole?: UserRole;
    metadata?: Record<string, string | number | boolean>;
  }
): void {
  if (!isAnalyticsEnabled()) {
    return;
  }

  const eventData: AnalyticsEventData = {
    event,
    userId: options?.userId,
    userRole: options?.userRole,
    timestamp: new Date(),
    metadata: options?.metadata,
  };

  eventLog.push(eventData);

  // Keep only last 1000 events in memory
  if (eventLog.length > 1000) {
    eventLog = eventLog.slice(-1000);
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event, options?.metadata || "");
  }
}

/**
 * Get summary statistics for soft launch tracking
 */
export function getAnalyticsSummary(): {
  totalEvents: number;
  eventCounts: Record<string, number>;
  uniqueUsers: number;
  recentEvents: AnalyticsEventData[];
} {
  const eventCounts: Record<string, number> = {};
  const uniqueUserIds = new Set<string>();

  for (const event of eventLog) {
    eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    if (event.userId) {
      uniqueUserIds.add(event.userId);
    }
  }

  return {
    totalEvents: eventLog.length,
    eventCounts,
    uniqueUsers: uniqueUserIds.size,
    recentEvents: eventLog.slice(-10),
  };
}

/**
 * Get key metrics for the soft launch dashboard
 */
export function getSoftLaunchMetrics(): {
  signUps: number;
  cvsCreated: number;
  searchesPerformed: number;
  interviewsRequested: number;
  interviewsAccepted: number;
  messagesSent: number;
  invitesSent: number;
  feedbackReceived: number;
} {
  const counts = getAnalyticsSummary().eventCounts;

  return {
    signUps: counts["sign_up"] || 0,
    cvsCreated: counts["cv_created"] || 0,
    searchesPerformed: counts["search_performed"] || 0,
    interviewsRequested: counts["interview_requested"] || 0,
    interviewsAccepted: counts["interview_accepted"] || 0,
    messagesSent: counts["message_sent"] || 0,
    invitesSent: counts["invite_sent"] || 0,
    feedbackReceived: counts["feedback_submitted"] || 0,
  };
}

/**
 * Clear analytics data (for testing)
 */
export function clearAnalytics(): void {
  eventLog = [];
}
