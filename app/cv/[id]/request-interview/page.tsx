"use client";

import { useRouter, useParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import {
  checkRateLimit,
  recordAction,
  getRateLimitStatus,
} from "@/lib/rateLimiting";
import { trackEvent } from "@/lib/analytics";

type InterviewType = "virtual" | "physical" | "";

export default function RequestInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [interviewType, setInterviewType] = useState<InterviewType>("");
  const [submitted, setSubmitted] = useState(false);
  const [rateLimitError, setRateLimitError] = useState("");
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    setRateLimitStatus(getRateLimitStatus("interview_request"));
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Check rate limit before submitting
    const rateCheck = checkRateLimit("interview_request");
    if (!rateCheck.allowed) {
      setRateLimitError(rateCheck.message || "Rate limit exceeded.");
      return;
    }

    // Record the action
    recordAction("interview_request");

    // Track for analytics
    trackEvent("interview_requested", {
      userRole: "employer",
      metadata: { interviewType },
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main>
        <section>
          <h1>Interview Request Sent</h1>
          <p>
            Your interview request has been submitted. The candidate will be
            notified and can respond to your request.
          </p>
          <div>
            <Link href={`/cv/${id}`}>Back to Profile</Link>
          </div>
          <div>
            <Link href="/employer/dashboard">Go to Dashboard</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Request Interview</h1>
        <p>
          Send an interview request to this candidate. Select the interview type
          and provide the necessary details.
        </p>

        {rateLimitStatus && (
          <p>
            <small>
              Interview requests: {rateLimitStatus.remaining} of{" "}
              {rateLimitStatus.limit} remaining this hour
            </small>
          </p>
        )}

        {rateLimitError && (
          <p role="alert">
            <strong>{rateLimitError}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Interview Type</legend>

            <div>
              <label>
                <input
                  type="radio"
                  name="interviewType"
                  value="virtual"
                  checked={interviewType === "virtual"}
                  onChange={() => setInterviewType("virtual")}
                  required
                />
                Virtual
              </label>
            </div>

            <div>
              <label>
                <input
                  type="radio"
                  name="interviewType"
                  value="physical"
                  checked={interviewType === "physical"}
                  onChange={() => setInterviewType("physical")}
                  required
                />
                Physical
              </label>
            </div>
          </fieldset>

          {interviewType === "virtual" && (
            <fieldset>
              <legend>Virtual Interview Details</legend>

              <div>
                <label htmlFor="platform">Platform</label>
                <select id="platform" name="platform" required>
                  <option value="">Select platform</option>
                  <option value="zoom">Zoom</option>
                  <option value="google-meet">Google Meet</option>
                  <option value="microsoft-teams">Microsoft Teams</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="meetingLink">Meeting Link (optional)</label>
                <input
                  type="url"
                  id="meetingLink"
                  name="meetingLink"
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div>
                <label htmlFor="virtualNote">
                  Additional Notes (optional)
                </label>
                <textarea
                  id="virtualNote"
                  name="virtualNote"
                  rows={3}
                  placeholder="Any additional instructions for joining the call"
                />
              </div>

              <div>
                <label htmlFor="virtualDate">Proposed Date</label>
                <input type="date" id="virtualDate" name="virtualDate" required />
              </div>

              <div>
                <label htmlFor="virtualTime">Proposed Time</label>
                <input type="time" id="virtualTime" name="virtualTime" required />
              </div>
            </fieldset>
          )}

          {interviewType === "physical" && (
            <fieldset>
              <legend>Physical Interview Details</legend>

              <div>
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Office address or meeting location"
                  required
                />
              </div>

              <div>
                <label htmlFor="physicalDate">Date</label>
                <input
                  type="date"
                  id="physicalDate"
                  name="physicalDate"
                  required
                />
              </div>

              <div>
                <label htmlFor="physicalTime">Time</label>
                <input
                  type="time"
                  id="physicalTime"
                  name="physicalTime"
                  required
                />
              </div>
            </fieldset>
          )}

          {interviewType && (
            <fieldset>
              <legend>Message</legend>

              <div>
                <label htmlFor="message">Message to Candidate (optional)</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Introduce yourself and explain the opportunity..."
                />
              </div>
            </fieldset>
          )}

          <div>
            <button type="submit" disabled={!interviewType}>
              Send Interview Request
            </button>
          </div>

          <div>
            <Link href={`/cv/${id}`}>Cancel</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
