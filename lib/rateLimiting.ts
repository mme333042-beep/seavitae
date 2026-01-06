/**
 * SeaVitae Rate Limiting (V1)
 *
 * Light rate limiting for abuse prevention.
 * This is client-side tracking for V1 - production would use server-side limits.
 */

export type RateLimitAction =
  | "interview_request"
  | "message"
  | "invite";

interface RateLimitConfig {
  maxActions: number;
  windowMinutes: number;
  cooldownMinutes: number;
}

// Rate limit configurations per action type
const RATE_LIMITS: Record<RateLimitAction, RateLimitConfig> = {
  interview_request: {
    maxActions: 10,
    windowMinutes: 60,
    cooldownMinutes: 15,
  },
  message: {
    maxActions: 20,
    windowMinutes: 60,
    cooldownMinutes: 10,
  },
  invite: {
    maxActions: 5,
    windowMinutes: 60,
    cooldownMinutes: 30,
  },
};

interface ActionRecord {
  action: RateLimitAction;
  timestamp: number;
}

// In-memory storage for V1 - production would use persistent storage
let actionHistory: ActionRecord[] = [];

/**
 * Record an action for rate limiting
 */
export function recordAction(action: RateLimitAction): void {
  actionHistory.push({
    action,
    timestamp: Date.now(),
  });

  // Clean up old records (older than 2 hours)
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  actionHistory = actionHistory.filter((r) => r.timestamp > twoHoursAgo);
}

/**
 * Check if an action is allowed under rate limits
 */
export function checkRateLimit(action: RateLimitAction): {
  allowed: boolean;
  remaining: number;
  resetInMinutes: number;
  message?: string;
} {
  const config = RATE_LIMITS[action];
  const windowStart = Date.now() - config.windowMinutes * 60 * 1000;

  const recentActions = actionHistory.filter(
    (r) => r.action === action && r.timestamp > windowStart
  );

  const count = recentActions.length;
  const remaining = Math.max(0, config.maxActions - count);

  if (count >= config.maxActions) {
    // Find when the oldest action in the window will expire
    const oldestInWindow = recentActions[0];
    const resetTime = oldestInWindow.timestamp + config.windowMinutes * 60 * 1000;
    const resetInMinutes = Math.ceil((resetTime - Date.now()) / (60 * 1000));

    return {
      allowed: false,
      remaining: 0,
      resetInMinutes,
      message: getRateLimitMessage(action, resetInMinutes),
    };
  }

  return {
    allowed: true,
    remaining,
    resetInMinutes: 0,
  };
}

/**
 * Get a user-friendly rate limit message
 */
function getRateLimitMessage(action: RateLimitAction, minutes: number): string {
  const actionLabels: Record<RateLimitAction, string> = {
    interview_request: "interview requests",
    message: "messages",
    invite: "invitations",
  };

  return `You have reached the limit for ${actionLabels[action]}. Please wait ${minutes} minute${minutes !== 1 ? "s" : ""} before trying again.`;
}

/**
 * Get rate limit status for display
 */
export function getRateLimitStatus(action: RateLimitAction): {
  used: number;
  limit: number;
  remaining: number;
} {
  const config = RATE_LIMITS[action];
  const windowStart = Date.now() - config.windowMinutes * 60 * 1000;

  const recentActions = actionHistory.filter(
    (r) => r.action === action && r.timestamp > windowStart
  );

  const used = recentActions.length;

  return {
    used,
    limit: config.maxActions,
    remaining: Math.max(0, config.maxActions - used),
  };
}

/**
 * Reset rate limits (for testing only)
 */
export function resetRateLimits(): void {
  actionHistory = [];
}
