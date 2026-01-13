"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getInbox, getSentMessages, getUnreadCount } from "@/lib/supabase/services/messages";
import type { UserRole, Message, User } from "@/lib/supabase/types";

interface MessageWithSender extends Message {
  sender?: User;
}

interface MessageWithRecipient extends Message {
  recipient?: User;
}

interface ConversationSummary {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserRole: string;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: number;
  subject: string | null;
}

// Group messages into conversations by the other participant
function groupIntoConversations(
  inboxMessages: MessageWithSender[],
  sentMessages: MessageWithRecipient[],
  currentUserId: string
): ConversationSummary[] {
  const conversationMap = new Map<string, ConversationSummary>();

  // Process inbox messages
  inboxMessages.forEach((msg) => {
    const otherUserId = msg.sender_id;
    const existing = conversationMap.get(otherUserId);
    const msgDate = new Date(msg.created_at);

    if (!existing || msgDate > existing.lastMessageAt) {
      conversationMap.set(otherUserId, {
        id: otherUserId,
        otherUserId,
        otherUserName: msg.sender?.email?.split("@")[0] || "Unknown User",
        otherUserRole: msg.sender?.role || "unknown",
        lastMessageAt: msgDate,
        lastMessagePreview: msg.content.substring(0, 60) + (msg.content.length > 60 ? "..." : ""),
        unreadCount: msg.is_read ? (existing?.unreadCount || 0) : (existing?.unreadCount || 0) + 1,
        subject: msg.subject,
      });
    } else if (!msg.is_read) {
      existing.unreadCount += 1;
    }
  });

  // Process sent messages
  sentMessages.forEach((msg) => {
    const otherUserId = msg.recipient_id;
    const existing = conversationMap.get(otherUserId);
    const msgDate = new Date(msg.created_at);

    if (!existing || msgDate > existing.lastMessageAt) {
      conversationMap.set(otherUserId, {
        id: otherUserId,
        otherUserId,
        otherUserName: msg.recipient?.email?.split("@")[0] || "Unknown User",
        otherUserRole: msg.recipient?.role || "unknown",
        lastMessageAt: msgDate,
        lastMessagePreview: "You: " + msg.content.substring(0, 55) + (msg.content.length > 55 ? "..." : ""),
        unreadCount: existing?.unreadCount || 0,
        subject: existing?.subject || msg.subject,
      });
    }
  });

  // Convert to array and sort by last message time
  return Array.from(conversationMap.values())
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

function formatMessageTime(date: Date): string {
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

export default function MessagesInboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<UserRole>("jobseeker");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          router.push("/login");
          return;
        }

        setUserRole(userProfile.role);
        setCurrentUserId(userProfile.user?.id || "");

        if (userProfile.profile) {
          if ("full_name" in userProfile.profile) {
            setUserName(userProfile.profile.full_name || "Jobseeker");
          } else if ("display_name" in userProfile.profile) {
            setUserName(userProfile.profile.display_name || "Employer");
          }
        }

        // Fetch messages from Supabase
        const [inboxResult, sentResult, unreadCount] = await Promise.all([
          getInbox(1, 100),
          getSentMessages(1, 100),
          getUnreadCount(),
        ]);

        // Group into conversations
        const grouped = groupIntoConversations(
          inboxResult.messages,
          sentResult.messages,
          userProfile.user?.id || ""
        );

        setConversations(grouped);
        setTotalUnread(unreadCount);
        setLoading(false);
      } catch (err) {
        console.error("Error loading messages:", err);
        setError("Failed to load messages. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main>
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Messages</h1>
          <p>
            {totalUnread > 0
              ? `${totalUnread} unread message${totalUnread !== 1 ? "s" : ""}`
              : "All messages read"}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <div className="user-info">
            <strong>{userName}</strong>
            <br />
            <span>{userRole === "employer" ? "Employer" : "Jobseeker"}</span>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {/* Conversations */}
      <section aria-label="Conversations">
        <h2>Conversations</h2>

        {conversations.length === 0 ? (
          <div className="card empty-state">
            <p>
              <strong>No conversations yet.</strong>
            </p>
            <p>
              {userRole === "employer"
                ? "When you message candidates or receive messages, they will appear here."
                : "When employers message you, conversations will appear here."}
            </p>
          </div>
        ) : (
          <div className="results-list">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.otherUserId}`}
                className="action-card"
                style={{ display: "block" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "var(--space-sm)",
                  }}
                >
                  <div>
                    <strong>{conversation.otherUserName}</strong>
                    {conversation.unreadCount > 0 && (
                      <span
                        className="cv-state cv-state-active"
                        style={{ marginLeft: "var(--space-sm)" }}
                      >
                        {conversation.unreadCount} new
                      </span>
                    )}
                  </div>
                  <span className="form-help">
                    {formatMessageTime(conversation.lastMessageAt)}
                  </span>
                </div>

                {conversation.subject && (
                  <p className="form-help" style={{ margin: 0 }}>
                    Re: {conversation.subject}
                  </p>
                )}

                <p
                  style={{
                    margin: "var(--space-sm) 0 0 0",
                    color: "var(--sv-body)",
                  }}
                >
                  {conversation.lastMessagePreview}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* About Messages */}
      <aside className="privacy-notice">
        <p>
          <strong>About Messages:</strong> Messages are for professional
          follow-up only. Keep communication relevant to the job opportunity or
          interview being discussed.
        </p>
      </aside>

      {/* Navigation */}
      <nav style={{ marginTop: "var(--space-xl)" }}>
        <Link href={userRole === "employer" ? "/employer/dashboard" : "/jobseeker/dashboard"}>
          Back to Dashboard
        </Link>
      </nav>
    </main>
  );
}
