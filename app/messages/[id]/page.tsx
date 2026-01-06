"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Conversation,
  Message,
  getOtherParticipant,
  getContextLabel,
  ParticipantRole,
} from "@/lib/messaging";
import {
  checkRateLimit,
  recordAction,
  getRateLimitStatus,
} from "@/lib/rateLimiting";
import MessageThread from "@/components/MessageThread";
import MessageCompose from "@/components/MessageCompose";
import ReportButton from "@/components/ReportButton";

// Mock current user - in production this would come from auth
const currentUserId = "user-1";
const currentUserRole: ParticipantRole = "employer";

// Mock conversation data
const mockConversation: Conversation = {
  id: "conv-1",
  participants: [
    { id: "user-1", name: "TechCorp Inc.", role: "employer" },
    { id: "user-2", name: "John Doe", role: "jobseeker" },
  ],
  context: "cv_profile",
  contextId: "1",
  contextTitle: "Senior Machine Learning Engineer",
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  lastMessagePreview:
    "Thank you for your interest. I would be happy to discuss...",
  unreadCount: 1,
};

// Mock messages
const mockMessages: Message[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-1",
    senderRole: "employer",
    content:
      "Hello John, I came across your profile and was impressed by your experience with recommendation systems. We have an opening for a Senior ML Engineer that might be a great fit.",
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "user-2",
    senderRole: "jobseeker",
    content:
      "Thank you for reaching out. I am interested in learning more about the role. Could you share more details about the team and the projects I would be working on?",
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "user-1",
    senderRole: "employer",
    content:
      "Of course. The team consists of 8 ML engineers working on personalization and search ranking. You would be leading the recommendation engine initiative. Would you be available for an interview next week?",
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: "msg-4",
    conversationId: "conv-1",
    senderId: "user-2",
    senderRole: "jobseeker",
    content:
      "Thank you for your interest. I would be happy to discuss further. Tuesday or Wednesday afternoon would work best for me.",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
];

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [conversation] = useState<Conversation>(mockConversation);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [rateLimitError, setRateLimitError] = useState("");
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  const otherParticipant = getOtherParticipant(conversation, currentUserId);

  useEffect(() => {
    setRateLimitStatus(getRateLimitStatus("message"));
  }, [messages]);

  function handleSendMessage(content: string) {
    // Check rate limit before sending
    const rateCheck = checkRateLimit("message");
    if (!rateCheck.allowed) {
      setRateLimitError(rateCheck.message || "Rate limit exceeded.");
      return;
    }

    // Record the action
    recordAction("message");

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      senderRole: currentUserRole,
      content,
      sentAt: new Date(),
      read: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setRateLimitError("");
    setRateLimitStatus(getRateLimitStatus("message"));
  }

  return (
    <main>
      <header>
        <h1>Conversation with {otherParticipant?.name}</h1>
        <p>
          <small>
            {getContextLabel(conversation.context)}: {conversation.contextTitle}
          </small>
        </p>
      </header>

      <nav>
        <Link href="/messages">Back to Messages</Link>
        {conversation.context === "cv_profile" && (
          <Link href={`/cv/${conversation.contextId}`}>View CV Profile</Link>
        )}
      </nav>

      <MessageThread messages={messages} currentUserRole={currentUserRole} />

      <section aria-label="Send Message">
        <h2>Reply</h2>

        {rateLimitStatus && (
          <p>
            <small>
              Messages: {rateLimitStatus.remaining} of {rateLimitStatus.limit}{" "}
              remaining this hour
            </small>
          </p>
        )}

        {rateLimitError && (
          <p role="alert">
            <strong>{rateLimitError}</strong>
          </p>
        )}

        <MessageCompose
          onSend={handleSendMessage}
          disabled={rateLimitStatus?.remaining === 0}
        />
      </section>

      <aside>
        <p>
          <small>
            Keep messages professional and relevant to the opportunity being
            discussed.
          </small>
        </p>
        <p>
          <ReportButton
            targetType={
              otherParticipant?.role === "employer"
                ? "employer_profile"
                : "cv_profile"
            }
            targetId={otherParticipant?.id || ""}
            targetName={otherParticipant?.name || "User"}
          />
        </p>
      </aside>
    </main>
  );
}
