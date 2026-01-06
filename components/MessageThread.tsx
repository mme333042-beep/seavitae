import { Message, formatMessageTime, ParticipantRole } from "@/lib/messaging";

interface MessageThreadProps {
  messages: Message[];
  currentUserRole: ParticipantRole;
}

/**
 * MessageThread displays a list of messages in a conversation.
 * Professional and minimal design, no chat app styling.
 */
export default function MessageThread({
  messages,
  currentUserRole,
}: MessageThreadProps) {
  if (messages.length === 0) {
    return (
      <section aria-label="Messages">
        <p>No messages yet. Send a message to start the conversation.</p>
      </section>
    );
  }

  return (
    <section aria-label="Messages">
      <ol>
        {messages.map((message) => {
          const isOwnMessage = message.senderRole === currentUserRole;

          return (
            <li key={message.id}>
              <article>
                <header>
                  <p>
                    <strong>
                      {isOwnMessage
                        ? "You"
                        : message.senderRole === "employer"
                        ? "Employer"
                        : "Jobseeker"}
                    </strong>
                  </p>
                  <p>
                    <small>{formatMessageTime(message.sentAt)}</small>
                  </p>
                </header>
                <p>{message.content}</p>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
