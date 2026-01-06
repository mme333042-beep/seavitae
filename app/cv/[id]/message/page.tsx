"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { validateMessage } from "@/lib/messaging";
import {
  checkRateLimit,
  recordAction,
  getRateLimitStatus,
} from "@/lib/rateLimiting";
import { trackEvent } from "@/lib/analytics";

export default function SendMessagePage() {
  const params = useParams();
  const router = useRouter();
  const cvId = params.id as string;

  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [rateLimitError, setRateLimitError] = useState("");
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  // Mock candidate data - in production this would come from a database
  const candidateName = "John Doe";
  const candidateRole = "Senior Machine Learning Engineer";

  useEffect(() => {
    setRateLimitStatus(getRateLimitStatus("message"));
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateMessage(content);
    if (!validation.valid) {
      setError(validation.error || "Invalid message.");
      return;
    }

    // Check rate limit before sending
    const rateCheck = checkRateLimit("message");
    if (!rateCheck.allowed) {
      setRateLimitError(rateCheck.message || "Rate limit exceeded.");
      return;
    }

    // Record the action
    recordAction("message");

    // Track for analytics
    trackEvent("message_sent", {
      userRole: "employer",
    });

    // Mock send - in production this would create a conversation
    setSent(true);
  }

  if (sent) {
    return (
      <main>
        <section>
          <h1>Message Sent</h1>
          <p>
            Your message has been sent to {candidateName}. They will be notified
            and can respond through the messaging system.
          </p>
          <div>
            <Link href={`/cv/${cvId}`}>Back to Profile</Link>
          </div>
          <div>
            <Link href="/messages">Go to Messages</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Send Message</h1>
        <p>
          To: {candidateName} ({candidateRole})
        </p>
      </header>

      <section>
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

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="subject">Regarding</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={candidateRole}
              disabled
            />
            <p>
              <small>
                This message will be linked to the candidate's CV profile.
              </small>
            </p>
          </div>

          <div>
            <label htmlFor="messageContent">Your Message</label>
            <textarea
              id="messageContent"
              name="messageContent"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError("");
              }}
              rows={6}
              placeholder="Introduce yourself and explain why you are reaching out..."
              maxLength={2000}
              required
            />
            {error && <p role="alert">{error}</p>}
            <p>
              <small>{content.length}/2000 characters</small>
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={!content.trim() || rateLimitStatus?.remaining === 0}
            >
              Send Message
            </button>
          </div>
        </form>
      </section>

      <aside>
        <h2>Messaging Guidelines</h2>
        <ul>
          <li>Keep your message professional and relevant</li>
          <li>Introduce yourself and your company</li>
          <li>Explain why you are interested in this candidate</li>
          <li>Be clear about the opportunity you are offering</li>
        </ul>
        <p>
          <small>
            Messages are plain text only. No file attachments or formatting.
          </small>
        </p>
      </aside>

      <div>
        <Link href={`/cv/${cvId}`}>Cancel</Link>
      </div>
    </main>
  );
}
