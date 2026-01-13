"use client";

import { useRouter, useParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { trackInterviewRequested } from "@/lib/posthog";
import { getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getMyEmployerProfile } from "@/lib/supabase/services/employers";
import { getJobseekerById } from "@/lib/supabase/services/jobseekers";
import {
  createInterviewRequest,
  hasExistingInterviewRequest,
} from "@/lib/supabase/services/interviews";
import { notifyInterviewRequest } from "@/lib/notifications";
import type { Employer, Jobseeker, InterviewType } from "@/lib/supabase/types";

export default function RequestInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [interviewType, setInterviewType] = useState<"video" | "in_person" | "phone" | "">("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [jobseeker, setJobseeker] = useState<Jobseeker | null>(null);
  const [existingRequest, setExistingRequest] = useState(false);
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

        // Store current user ID for notifications
        setCurrentUserId(userProfile.user?.id || null);

        const employerProfile = await getMyEmployerProfile();
        if (!employerProfile) {
          router.push("/employer");
          return;
        }

        // Check if employer is verified
        if (!employerProfile.is_verified) {
          setError("Your account must be verified before you can request interviews.");
          setLoading(false);
          return;
        }

        setEmployer(employerProfile);

        // Get jobseeker info
        const jobseekerData = await getJobseekerById(id);
        if (!jobseekerData) {
          setError("Candidate not found.");
          setLoading(false);
          return;
        }

        setJobseeker(jobseekerData);

        // Check for existing interview request
        const existing = await hasExistingInterviewRequest(id);
        if (existing.exists) {
          setExistingRequest(true);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load page. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employer || !jobseeker) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    // Build proposed date from date and time inputs
    let proposedDate: string | undefined;
    const dateValue = formData.get("proposedDate") as string;
    const timeValue = formData.get("proposedTime") as string;

    if (dateValue && timeValue) {
      proposedDate = new Date(`${dateValue}T${timeValue}`).toISOString();
    } else if (dateValue) {
      proposedDate = new Date(dateValue).toISOString();
    }

    // Get location based on interview type
    let location: string | undefined;
    if (interviewType === "in_person") {
      location = formData.get("location") as string;
    } else if (interviewType === "video") {
      const platform = formData.get("platform") as string;
      const meetingLink = formData.get("meetingLink") as string;
      location = meetingLink || platform;
    }

    const message = formData.get("message") as string;

    try {
      const result = await createInterviewRequest(id, {
        proposedDate,
        proposedLocation: location,
        interviewType: interviewType as InterviewType,
        message: message || undefined,
      });

      if (!result.success) {
        setError(result.error || "Failed to send interview request");
        setSubmitting(false);
        return;
      }

      // Send email notification to jobseeker
      if (currentUserId && jobseeker.user_id) {
        notifyInterviewRequest(
          jobseeker.user_id,
          currentUserId,
          interviewType,
          proposedDate,
          message || undefined
        );
      }

      // Track for analytics
      trackEvent("interview_requested", {
        userRole: "employer",
        metadata: { interviewType },
      });

      // Track interview requested (PostHog funnel tracking)
      trackInterviewRequested();

      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error("Error creating interview request:", err);
      setError("Failed to send interview request. Please try again.");
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
          <h1>Request Interview</h1>
          <div className="card">
            <div role="alert" className="alert alert-error">
              {error}
            </div>
            <p style={{ marginTop: "var(--space-lg)" }}>
              <Link href={`/cv/${id}`}>Back to Profile</Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (existingRequest) {
    return (
      <main>
        <section>
          <h1>Interview Already Requested</h1>
          <div className="card">
            <p>
              You have already sent an interview request to this candidate.
              You can view the status of your request in your interviews page.
            </p>
            <div style={{ marginTop: "var(--space-lg)", display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
              <Link href="/employer/interviews" className="btn">
                View My Interviews
              </Link>
              <Link href={`/cv/${id}`} className="btn btn-secondary">
                Back to Profile
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (submitted) {
    return (
      <main>
        <section>
          <h1>Interview Request Sent</h1>
          <div className="card">
            <p>
              <strong>Your interview request has been sent to {jobseeker?.full_name}!</strong>
            </p>
            <p>
              The candidate will be notified and can respond to your request.
              You will be able to see their response in your interviews page.
            </p>
            <p className="form-help" style={{ marginTop: "var(--space-md)" }}>
              Once the candidate accepts, their contact information will be shared with you.
            </p>
          </div>
          <div style={{ marginTop: "var(--space-lg)", display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
            <Link href="/employer/interviews" className="btn">
              View My Interviews
            </Link>
            <Link href={`/cv/${id}`} className="btn btn-secondary">
              Back to Profile
            </Link>
            <Link href="/employer/dashboard" className="btn btn-secondary">
              Go to Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Request Interview</h1>

        {jobseeker && (
          <div className="card" style={{ marginBottom: "var(--space-lg)" }}>
            <p style={{ margin: 0 }}>
              <strong>Requesting interview with:</strong> {jobseeker.full_name}
            </p>
            {jobseeker.preferred_role && (
              <p className="form-help" style={{ margin: "var(--space-xs) 0 0 0" }}>
                {jobseeker.preferred_role}
                {jobseeker.city && ` - ${jobseeker.city}`}
              </p>
            )}
          </div>
        )}

        <p>
          Send an interview request to this candidate. Select the interview type
          and provide the necessary details.
        </p>

        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Interview Type *</legend>

            <div>
              <label>
                <input
                  type="radio"
                  name="interviewType"
                  value="video"
                  checked={interviewType === "video"}
                  onChange={() => setInterviewType("video")}
                  required
                />
                Video Call
              </label>
            </div>

            <div>
              <label>
                <input
                  type="radio"
                  name="interviewType"
                  value="in_person"
                  checked={interviewType === "in_person"}
                  onChange={() => setInterviewType("in_person")}
                  required
                />
                In-Person
              </label>
            </div>

            <div>
              <label>
                <input
                  type="radio"
                  name="interviewType"
                  value="phone"
                  checked={interviewType === "phone"}
                  onChange={() => setInterviewType("phone")}
                  required
                />
                Phone Call
              </label>
            </div>
          </fieldset>

          {interviewType === "video" && (
            <fieldset>
              <legend>Video Call Details</legend>

              <div>
                <label htmlFor="platform">Platform *</label>
                <select id="platform" name="platform" required>
                  <option value="">Select platform</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Other">Other</option>
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
                <p className="form-help">
                  You can provide the meeting link now or send it later via message.
                </p>
              </div>

              <div>
                <label htmlFor="proposedDate">Proposed Date *</label>
                <input
                  type="date"
                  id="proposedDate"
                  name="proposedDate"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div>
                <label htmlFor="proposedTime">Proposed Time *</label>
                <input type="time" id="proposedTime" name="proposedTime" required />
              </div>
            </fieldset>
          )}

          {interviewType === "in_person" && (
            <fieldset>
              <legend>In-Person Interview Details</legend>

              <div>
                <label htmlFor="location">Location / Address *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Office address or meeting location"
                  required
                />
              </div>

              <div>
                <label htmlFor="proposedDate">Date *</label>
                <input
                  type="date"
                  id="proposedDate"
                  name="proposedDate"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div>
                <label htmlFor="proposedTime">Time *</label>
                <input type="time" id="proposedTime" name="proposedTime" required />
              </div>
            </fieldset>
          )}

          {interviewType === "phone" && (
            <fieldset>
              <legend>Phone Call Details</legend>

              <div>
                <label htmlFor="proposedDate">Proposed Date *</label>
                <input
                  type="date"
                  id="proposedDate"
                  name="proposedDate"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div>
                <label htmlFor="proposedTime">Proposed Time *</label>
                <input type="time" id="proposedTime" name="proposedTime" required />
              </div>

              <p className="form-help">
                Your phone number will be shared with the candidate after they accept the interview request.
              </p>
            </fieldset>
          )}

          {interviewType && (
            <fieldset>
              <legend>Message to Candidate</legend>

              <div>
                <label htmlFor="message">Message (optional)</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Introduce yourself and explain the opportunity..."
                />
                <p className="form-help">
                  A brief introduction helps candidates understand the opportunity better.
                </p>
              </div>
            </fieldset>
          )}

          <div style={{ marginTop: "var(--space-lg)" }}>
            <button type="submit" disabled={!interviewType || submitting}>
              {submitting ? "Sending..." : "Send Interview Request"}
            </button>
          </div>

          <div style={{ marginTop: "var(--space-md)" }}>
            <Link href={`/cv/${id}`}>Cancel</Link>
          </div>
        </form>
      </section>

      {/* Privacy Notice */}
      <aside className="privacy-notice">
        <p>
          <strong>Privacy:</strong> Your contact information will only be shared with the
          candidate after they accept your interview request.
        </p>
      </aside>
    </main>
  );
}
