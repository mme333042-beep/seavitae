/**
 * SeaVitae Feedback System (Soft Launch)
 *
 * Collects constructive feedback from early access users.
 */

import { isFeedbackEnabled } from "./softLaunch";

export type FeedbackCategory =
  | "general"
  | "usability"
  | "feature_request"
  | "bug_report"
  | "profile"
  | "search"
  | "messaging"
  | "interviews";

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface FeedbackCategoryOption {
  value: FeedbackCategory;
  label: string;
  description: string;
}

export const FEEDBACK_CATEGORIES: FeedbackCategoryOption[] = [
  {
    value: "general",
    label: "General Feedback",
    description: "Overall thoughts about SeaVitae",
  },
  {
    value: "usability",
    label: "Ease of Use",
    description: "How easy or difficult something was to use",
  },
  {
    value: "feature_request",
    label: "Feature Request",
    description: "Something you'd like to see added",
  },
  {
    value: "bug_report",
    label: "Bug Report",
    description: "Something that didn't work as expected",
  },
  {
    value: "profile",
    label: "CV Profile",
    description: "Feedback about creating or viewing profiles",
  },
  {
    value: "search",
    label: "Search & Discovery",
    description: "Feedback about finding candidates or being found",
  },
  {
    value: "messaging",
    label: "Messaging",
    description: "Feedback about the messaging system",
  },
  {
    value: "interviews",
    label: "Interview Requests",
    description: "Feedback about the interview request process",
  },
];

export interface Feedback {
  id: string;
  userId?: string;
  userRole?: "jobseeker" | "employer";
  category: FeedbackCategory;
  rating?: FeedbackRating;
  message: string;
  pageUrl?: string;
  createdAt: Date;
}

// In-memory storage for soft launch
let feedbackList: Feedback[] = [];

/**
 * Submit feedback
 */
export function submitFeedback(
  category: FeedbackCategory,
  message: string,
  options?: {
    userId?: string;
    userRole?: "jobseeker" | "employer";
    rating?: FeedbackRating;
    pageUrl?: string;
  }
): { success: boolean; error?: string } {
  if (!isFeedbackEnabled()) {
    return { success: false, error: "Feedback collection is not enabled." };
  }

  if (!message.trim()) {
    return { success: false, error: "Please provide your feedback." };
  }

  if (message.length > 2000) {
    return { success: false, error: "Feedback cannot exceed 2000 characters." };
  }

  const feedback: Feedback = {
    id: `fb-${Date.now()}`,
    userId: options?.userId,
    userRole: options?.userRole,
    category,
    rating: options?.rating,
    message: message.trim(),
    pageUrl: options?.pageUrl,
    createdAt: new Date(),
  };

  feedbackList.push(feedback);

  return { success: true };
}

/**
 * Validate feedback before submission
 */
export function validateFeedback(
  category: FeedbackCategory | "",
  message: string
): { valid: boolean; error?: string } {
  if (!category) {
    return { valid: false, error: "Please select a category." };
  }

  if (!message.trim()) {
    return { valid: false, error: "Please provide your feedback." };
  }

  if (message.length > 2000) {
    return { valid: false, error: "Feedback cannot exceed 2000 characters." };
  }

  return { valid: true };
}

/**
 * Get all feedback (for admin review)
 */
export function getAllFeedback(): Feedback[] {
  return [...feedbackList].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Get feedback summary for soft launch review
 */
export function getFeedbackSummary(): {
  total: number;
  byCategory: Record<string, number>;
  averageRating: number | null;
  recent: Feedback[];
} {
  const byCategory: Record<string, number> = {};
  let ratingSum = 0;
  let ratingCount = 0;

  for (const fb of feedbackList) {
    byCategory[fb.category] = (byCategory[fb.category] || 0) + 1;
    if (fb.rating) {
      ratingSum += fb.rating;
      ratingCount++;
    }
  }

  return {
    total: feedbackList.length,
    byCategory,
    averageRating: ratingCount > 0 ? ratingSum / ratingCount : null,
    recent: feedbackList.slice(-5),
  };
}

/**
 * Get category label
 */
export function getCategoryLabel(category: FeedbackCategory): string {
  const option = FEEDBACK_CATEGORIES.find((c) => c.value === category);
  return option?.label || category;
}
