"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Conversation,
  getOtherParticipant,
  formatMessageTime,
  getContextLabel,
} from "@/lib/messaging";

// Mock current user - in production this would come from auth
const currentUserId = "user-1";
const currentUserRole = "employer" as const;

// Mock conversations - in production this would come from a database
const mockConversations: Conversation[] = [
  {
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
  },
  {
    id: "conv-2",
    participants: [
      { id: "user-1", name: "TechCorp Inc.", role: "employer" },
      { id: "user-3", name: "Jane Smith", role: "jobseeker" },
    ],
    context: "interview_request",
    contextId: "req-1",
    contextTitle: "Full Stack Developer Interview",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastMessagePreview: "Looking forward to the interview next week.",
    unreadCount: 0,
  },
  {
    id: "conv-3",
    participants: [
      { id: "user-1", name: "TechCorp Inc.", role: "employer" },
      { id: "user-4", name: "Michael Chen", role: "jobseeker" },
    ],
    context: "cv_profile",
    contextId: "3",
    contextTitle: "Data Scientist",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000),
    lastMessagePreview:
      "Could you tell me more about the analytics projects at...",
    unreadCount: 2,
  },
];

export default function MessagesInboxPage() {
  const [conversations] = useState<Conversation[]>(mockConversations);

  const sortedConversations = [...conversations].sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  );

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  return (
    <main>
      <header>
        <h1>Messages</h1>
        <p>
          {totalUnread > 0
            ? `${totalUnread} unread message${totalUnread !== 1 ? "s" : ""}`
            : "All messages read"}
        </p>
      </header>

      <section aria-label="Conversations">
        {sortedConversations.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <ul>
            {sortedConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(
                conversation,
                currentUserId
              );

              return (
                <li key={conversation.id}>
                  <Link href={`/messages/${conversation.id}`}>
                    <article>
                      <header>
                        <p>
                          <strong>{otherParticipant?.name}</strong>
                          {conversation.unreadCount > 0 && (
                            <span> ({conversation.unreadCount} new)</span>
                          )}
                        </p>
                        <p>
                          <small>
                            {formatMessageTime(conversation.lastMessageAt)}
                          </small>
                        </p>
                      </header>

                      <p>
                        <small>{getContextLabel(conversation.context)}</small>
                      </p>
                      <p>
                        <small>{conversation.contextTitle}</small>
                      </p>

                      <p>{conversation.lastMessagePreview}</p>
                    </article>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <aside>
        <h2>About Messages</h2>
        <p>
          Messages are for professional follow-up only. Keep communication
          relevant to the job opportunity or interview being discussed.
        </p>
      </aside>

      <div>
        <Link href="/employer/dashboard">Back to Dashboard</Link>
      </div>
    </main>
  );
}
