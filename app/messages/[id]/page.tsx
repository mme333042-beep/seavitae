"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUserWithProfile } from "@/lib/supabase/auth";
import {
  getConversation,
  sendMessage as sendMessageService,
  markAsRead,
} from "@/lib/supabase/services/messages";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  checkRateLimit,
  recordAction,
  getRateLimitStatus,
} from "@/lib/rateLimiting";
import MessageThread from "@/components/MessageThread";
import MessageCompose from "@/components/MessageCompose";
import ReportButton from "@/components/ReportButton";
import type { Message as DBMessage, User, UserRole } from "@/lib/supabase/types";
import type { ParticipantRole, Message as UIMessage } from "@/lib/messaging";

interface OtherUser {
  id: string;
  name: string;
  role: UserRole;
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const otherUserId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<ParticipantRole>("jobseeker");
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [rateLimitError, setRateLimitError] = useState("");
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          router.push("/login");
          return;
        }

        setCurrentUserId(userProfile.user?.id || "");
        setCurrentUserRole(userProfile.role as ParticipantRole);

        // Fetch conversation messages
        const conversationData = await getConversation(otherUserId);

        // Fetch other user's details
        const supabase = getSupabaseClient();
        const { data: otherUserData } = await supabase
          .from("users")
          .select("id, email, role")
          .eq("id", otherUserId)
          .single();

        if (otherUserData) {
          setOtherUser({
            id: otherUserData.id,
            name: otherUserData.email?.split("@")[0] || "User",
            role: otherUserData.role as UserRole,
          });
        }

        // Transform messages to UI format
        const uiMessages: UIMessage[] = conversationData.messages.map((msg) => ({
          id: msg.id,
          conversationId: otherUserId,
          senderId: msg.sender_id,
          senderRole: msg.sender_id === userProfile.user?.id ? userProfile.role : (otherUserData?.role || "jobseeker"),
          content: msg.content,
          sentAt: new Date(msg.created_at),
          read: msg.is_read,
        }));

        // Sort by sent time (oldest first)
        uiMessages.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
        setMessages(uiMessages);

        // Mark unread messages as read
        for (const msg of conversationData.messages) {
          if (!msg.is_read && msg.recipient_id === userProfile.user?.id) {
            await markAsRead(msg.id);
          }
        }

        setRateLimitStatus(getRateLimitStatus("message"));
        setLoading(false);
      } catch (err) {
        console.error("Error loading conversation:", err);
        setError("Failed to load conversation. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [otherUserId, router]);

  async function handleSendMessage(content: string) {
    // Check rate limit before sending
    const rateCheck = checkRateLimit("message");
    if (!rateCheck.allowed) {
      setRateLimitError(rateCheck.message || "Rate limit exceeded.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const result = await sendMessageService(otherUserId, content);

      if (!result.success) {
        setError(result.error || "Failed to send message");
        setSending(false);
        return;
      }

      // Record the action
      recordAction("message");

      // Add message to local state
      if (result.message) {
        const newMessage: UIMessage = {
          id: result.message.id,
          conversationId: otherUserId,
          senderId: currentUserId,
          senderRole: currentUserRole,
          content: result.message.content,
          sentAt: new Date(result.message.created_at),
          read: false,
        };
        setMessages((prev) => [...prev, newMessage]);
      }

      setRateLimitError("");
      setRateLimitStatus(getRateLimitStatus("message"));
      setSending(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading conversation...</p>
      </main>
    );
  }

  if (!otherUser) {
    return (
      <main>
        <Link href="/messages">Back to Messages</Link>
        <div className="card">
          <p>User not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Conversation with {otherUser.name}</h1>
        <p className="form-help">
          {otherUser.role === "employer" ? "Employer" : "Jobseeker"}
        </p>
      </header>

      <nav style={{ marginBottom: "var(--space-lg)" }}>
        <Link href="/messages">Back to Messages</Link>
      </nav>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="card empty-state">
          <p><strong>No messages yet.</strong></p>
          <p>Start the conversation by sending a message below.</p>
        </div>
      ) : (
        <MessageThread messages={messages} currentUserRole={currentUserRole} />
      )}

      <section aria-label="Send Message" style={{ marginTop: "var(--space-xl)" }}>
        <h2>Reply</h2>

        {rateLimitStatus && (
          <p className="form-help">
            Messages: {rateLimitStatus.remaining} of {rateLimitStatus.limit}{" "}
            remaining this hour
          </p>
        )}

        {rateLimitError && (
          <div role="alert" className="alert alert-error">
            {rateLimitError}
          </div>
        )}

        <MessageCompose
          onSend={handleSendMessage}
          disabled={rateLimitStatus?.remaining === 0 || sending}
        />
      </section>

      <aside className="privacy-notice" style={{ marginTop: "var(--space-xl)" }}>
        <p>
          Keep messages professional and relevant to the opportunity being
          discussed.
        </p>
        <p style={{ marginTop: "var(--space-md)" }}>
          <ReportButton
            targetType={
              otherUser.role === "employer"
                ? "employer_profile"
                : "cv_profile"
            }
            targetId={otherUser.id}
            targetName={otherUser.name}
          />
        </p>
      </aside>
    </main>
  );
}
