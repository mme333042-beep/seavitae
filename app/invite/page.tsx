"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import {
  checkRateLimit,
  recordAction,
  getRateLimitStatus,
} from "@/lib/rateLimiting";
import { trackEvent } from "@/lib/analytics";

export default function InvitePage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [rateLimitError, setRateLimitError] = useState("");
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    setRateLimitStatus(getRateLimitStatus("invite"));
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check rate limit before sending
    const rateCheck = checkRateLimit("invite");
    if (!rateCheck.allowed) {
      setRateLimitError(rateCheck.message || "Rate limit exceeded.");
      return;
    }

    // Record the action
    recordAction("invite");

    // Track for analytics
    trackEvent("invite_sent");

    setError("");
    setRateLimitError("");
    setSubmitted(true);
  }

  function handleSendAnother() {
    setEmail("");
    setMessage("");
    setSubmitted(false);
    setError("");
    setRateLimitError("");
    setRateLimitStatus(getRateLimitStatus("invite"));
  }

  if (submitted) {
    return (
      <main>
        <section>
          <h1>Invitation Sent</h1>

          <p>
            Your invitation has been sent to <strong>{email}</strong>.
          </p>

          <p>
            They will receive an email with information about SeaVitae and how
            to create their profile.
          </p>

          <div>
            <button type="button" onClick={handleSendAnother}>
              Invite Another Professional
            </button>
          </div>

          <div>
            <Link href="/">Back to Home</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Invite a Professional</h1>

        <p>
          Know a talented professional who deserves to be discovered? Invite
          them to join SeaVitae and create their CV profile.
        </p>

        {rateLimitStatus && (
          <p>
            <small>
              Invitations: {rateLimitStatus.remaining} of {rateLimitStatus.limit}{" "}
              remaining this hour
            </small>
          </p>
        )}

        {rateLimitError && (
          <p role="alert">
            <strong>{rateLimitError}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
            {error && <p role="alert">{error}</p>}
          </div>

          <div>
            <label htmlFor="message">Personal Message (optional)</label>
            <textarea
              id="message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Add a personal note to your invitation..."
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={rateLimitStatus?.remaining === 0}
            >
              Send Invitation
            </button>
          </div>
        </form>

        <div>
          <Link href="/">Back to Home</Link>
        </div>
      </section>
    </main>
  );
}
