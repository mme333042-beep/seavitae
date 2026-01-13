"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateMessage } from "@/lib/messaging";
import { trackEvent } from "@/lib/analytics";
import { getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getMyEmployerProfile } from "@/lib/supabase/services/employers";
import { getJobseekerById } from "@/lib/supabase/services/jobseekers";
import { sendMessage } from "@/lib/supabase/services/messages";
import { notifyNewMessage } from "@/lib/notifications";
import type { Employer, Jobseeker } from "@/lib/supabase/types";

export default function SendMessagePage() {
  const params = useParams();
  const router = useRouter();
  const jobseekerId = params.id as string;

  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [jobseeker, setJobseeker] = useState<Jobseeker | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          router.push("/login");
          return;
        }

        if (userProfile.role !== "employer") {
          router.push("/jobseeker/dashboard");
          return;
        }

        setCurrentUserId(userProfile.user?.id || null);

        const employerProfile = await getMyEmployerProfile();
        if (!employerProfile) {
          router.push("/employer");
          return;
        }

        // Check if employer is verified
        if (!employerProfile.is_verified) {
          setError("Your account must be verified before you can send messages.");
          setLoading(false);
          return;
        }

        setEmployer(employerProfile);

        // Get jobseeker info
        const jobseekerData = await getJobseekerById(jobseekerId);
        if (!jobseekerData) {
          setError("Candidate not found.");
          setLoading(false);
          return;
        }

        setJobseeker(jobseekerData);
        setSubject(`Regarding: ${jobseekerData.preferred_role || "Job Opportunity"}`);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load page. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [jobseekerId, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employer || !jobseeker) return;

    const validation = validateMessage(content);
    if (!validation.valid) {
      setError(validation.error || "Invalid message.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Send message via Supabase
      const result = await sendMessage(jobseeker.user_id, content, subject);

      if (!result.success) {
        setError(result.error || "Failed to send message");
        setSubmitting(false);
        return;
      }

      // Send email notification to jobseeker
      if (currentUserId && jobseeker.user_id) {
        notifyNewMessage(jobseeker.user_id, currentUserId, content);
      }

      // Track for analytics
      trackEvent("message_sent", {
        userRole: "employer",
      });

      setSent(true);
      setSubmitting(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  if (error && !employer) {
    return (
      <main>
        <section>
          <h1>Send Message</h1>
          <div className="card">
            <div role="alert" className="alert alert-error">
              {error}
            </div>
            <p style={{ marginTop: "var(--space-lg)" }}>
              <Link href={`/cv/${jobseekerId}`}>Back to Profile</Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (sent) {
    return (
      <main>
        <section>
          <h1>Message Sent</h1>
          <div className="card">
            <p>
              <strong>Your message has been sent to {jobseeker?.full_name}!</strong>
            </p>
            <p>
              They will be notified and can respond through the messaging system.
            </p>
          </div>
          <div style={{ marginTop: "var(--space-lg)", display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
            <Link href={`/cv/${jobseekerId}`} className="btn btn-secondary">
              Back to Profile
            </Link>
            <Link href="/messages" className="btn">
              Go to Messages
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Send Message</h1>
        {jobseeker && (
          <div className="card" style={{ marginBottom: "var(--space-lg)" }}>
            <p style={{ margin: 0 }}>
              <strong>To:</strong> {jobseeker.full_name}
            </p>
            {jobseeker.preferred_role && (
              <p className="form-help" style={{ margin: "var(--space-xs) 0 0 0" }}>
                {jobseeker.preferred_role}
                {jobseeker.city && ` - ${jobseeker.city}`}
              </p>
            )}
          </div>
        )}
      </header>

      <section>
        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Job opportunity, Interview follow-up, etc."
              maxLength={200}
            />
          </div>

          <div>
            <label htmlFor="messageContent">Your Message *</label>
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
            <p className="form-help">
              {content.length}/2000 characters
            </p>
          </div>

          <div style={{ marginTop: "var(--space-lg)" }}>
            <button
              type="submit"
              disabled={!content.trim() || submitting}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </section>

      <aside className="card" style={{ marginTop: "var(--space-xl)" }}>
        <h2>Messaging Guidelines</h2>
        <ul>
          <li>Keep your message professional and relevant</li>
          <li>Introduce yourself and your company</li>
          <li>Explain why you are interested in this candidate</li>
          <li>Be clear about the opportunity you are offering</li>
        </ul>
        <p className="form-help">
          Messages are plain text only. No file attachments or formatting.
        </p>
      </aside>

      <div style={{ marginTop: "var(--space-lg)" }}>
        <Link href={`/cv/${jobseekerId}`}>Cancel</Link>
      </div>
    </main>
  );
}
