/**
 * SeaVitae Messaging System
 *
 * A lightweight, professional follow-up channel between employers and jobseekers.
 * This is not a social messaging or chat app.
 *
 * Features:
 * - Plain text messages only
 * - Context-aware (linked to CV profiles or interview requests)
 * - No emojis, reactions, typing indicators
 * - No file uploads or voice notes
 */

export type MessageContext = "cv_profile" | "interview_request";
export type ParticipantRole = "employer" | "jobseeker";

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: ParticipantRole;
  content: string;
  sentAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  context: MessageContext;
  contextId: string; // CV profile ID or interview request ID
  contextTitle: string; // e.g., "Regarding: Senior ML Engineer position"
  createdAt: Date;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: number;
}

/**
 * Validate message content
 * - Plain text only
 * - No empty messages
 * - Reasonable length limit
 */
export function validateMessage(content: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = content.trim();

  if (!trimmed) {
    return { valid: false, error: "Message cannot be empty." };
  }

  if (trimmed.length > 2000) {
    return {
      valid: false,
      error: "Message cannot exceed 2000 characters.",
    };
  }

  return { valid: true };
}

/**
 * Format message timestamp for display
 */
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: days > 365 ? "numeric" : undefined,
    });
  }
}

/**
 * Get the other participant in a conversation
 */
export function getOtherParticipant(
  conversation: Conversation,
  currentUserId: string
): Participant | undefined {
  return conversation.participants.find((p) => p.id !== currentUserId);
}

/**
 * Create a message preview for conversation list
 */
export function createMessagePreview(content: string, maxLength = 60): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.substring(0, maxLength).trim() + "...";
}

/**
 * Get context label for display
 */
export function getContextLabel(context: MessageContext): string {
  switch (context) {
    case "cv_profile":
      return "CV Profile Inquiry";
    case "interview_request":
      return "Interview Discussion";
    default:
      return "Message";
  }
}
