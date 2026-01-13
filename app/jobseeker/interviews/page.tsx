"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployerBadge from "@/components/EmployerBadge";
import ReportButton from "@/components/ReportButton";
import { trackEvent } from "@/lib/analytics";
import { trackInterviewAccepted } from "@/lib/posthog";
import { signOut, getCurrentUserWithProfile } from "@/lib/supabase/auth";
import {
  getMyInterviewsAsJobseeker,
  respondToInterview,
} from "@/lib/supabase/services/interviews";
import { getEmployerById } from "@/lib/supabase/services/employers";
import type { Interview, Employer } from "@/lib/supabase/types";
import type { EmployerProfile } from "@/lib/employerVerification";

interface InterviewWithEmployer extends Interview {
  employer?: Employer;
}

// Convert Supabase Employer to EmployerProfile for EmployerBadge
function toEmployerProfile(employer: Employer): EmployerProfile {
  return {
    id: employer.id,
    type: employer.employer_type,
    name: employer.display_name,
    city: employer.city ?? "",
    companyName: employer.company_name ?? undefined,
    industry: employer.industry ?? undefined,
    companySize: employer.company_size ?? undefined,
    website: employer.website ?? undefined,
    contactPersonName: employer.display_name,
    contactPersonRole: undefined,
    profession: undefined,
    linkedIn: employer.linkedin_url ?? undefined,
    hiringReason: employer.hiring_purpose as "startup" | "personal_project" | "freelance_work" | "household" | "other" | undefined,
    emailVerified: true,
    detailsCompleted: true,
    createdAt: new Date(employer.created_at),
  };
}

export default function JobseekerInterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewWithEmployer[]>([]);
  const [userName, setUserName] = useState<string>("Jobseeker");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          router.push("/jobseeker/signup");
          return;
        }
        if (userProfile.role !== "jobseeker") {
          router.push("/employer/dashboard");
          return;
        }
        if (userProfile.profile && "full_name" in userProfile.profile) {
          setUserName(userProfile.profile.full_name || "Jobseeker");
        }

        // Fetch interviews from Supabase
        const interviewsData = await getMyInterviewsAsJobseeker();
        setInterviews(interviewsData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading interviews:", err);
        setError("Failed to load interview requests. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  async function handleAccept(id: string) {
    setRespondingTo(id);
    setError(null);

    try {
      const result = await respondToInterview(id, "accepted");

      if (!result.success) {
        setError(result.error || "Failed to accept interview");
        setRespondingTo(null);
        return;
      }

      // Update local state
      setInterviews((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "accepted" } : req))
      );

      trackEvent("interview_accepted", {
        userRole: "jobseeker",
      });

      // Track interview accepted (PostHog funnel tracking)
      trackInterviewAccepted();

      setRespondingTo(null);
    } catch (err) {
      console.error("Error accepting interview:", err);
      setError("Failed to accept interview. Please try again.");
      setRespondingTo(null);
    }
  }

  async function handleDecline(id: string) {
    setRespondingTo(id);
    setError(null);

    try {
      const result = await respondToInterview(id, "declined");

      if (!result.success) {
        setError(result.error || "Failed to decline interview");
        setRespondingTo(null);
        return;
      }

      // Update local state
      setInterviews((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "declined" } : req))
      );

      trackEvent("interview_declined", {
        userRole: "jobseeker",
      });

      setRespondingTo(null);
    } catch (err) {
      console.error("Error declining interview:", err);
      setError("Failed to decline interview. Please try again.");
      setRespondingTo(null);
    }
  }

  const pendingRequests = interviews.filter((r) => r.status === "pending");
  const respondedRequests = interviews.filter((r) => r.status !== "pending");

  function formatDaysAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const days = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }

  function formatInterviewType(type: string | null): string {
    if (!type) return "Not specified";
    switch (type) {
      case "in_person":
        return "In-Person";
      case "video":
        return "Video Call";
      case "phone":
        return "Phone Call";
      default:
        return type;
    }
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
          <h1>Interview Requests</h1>
          <p>Review and respond to interview requests from employers.</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="user-info">
            <strong>{userName}</strong>
            <br />
            <span>Jobseeker</span>
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

      {/* Pending Requests */}
      <section aria-label="Pending Requests">
        <h2>Pending Requests ({pendingRequests.length})</h2>

        {pendingRequests.length === 0 ? (
          <div className="card empty-state">
            <p>
              <strong>No pending interview requests.</strong>
            </p>
            <p>
              When employers request interviews, they will appear here for your
              review.
            </p>
          </div>
        ) : (
          <div className="results-list">
            {pendingRequests.map((request) => (
              <article key={request.id} className="card">
                {request.employer && (
                  <div className="card-header">
                    <EmployerBadge employer={toEmployerProfile(request.employer)} showDetails />
                  </div>
                )}

                <div style={{ marginTop: "var(--space-lg)" }}>
                  <h3>Interview Details</h3>

                  <dl>
                    <dt>Type</dt>
                    <dd>{formatInterviewType(request.interview_type)}</dd>

                    {request.proposed_location && (
                      <>
                        <dt>Location</dt>
                        <dd>{request.proposed_location}</dd>
                      </>
                    )}

                    {request.proposed_date && (
                      <>
                        <dt>Proposed Date</dt>
                        <dd>{new Date(request.proposed_date).toLocaleDateString()}</dd>
                      </>
                    )}
                  </dl>

                  {request.message && (
                    <div
                      style={{
                        marginTop: "var(--space-lg)",
                        padding: "var(--space-md)",
                        backgroundColor: "var(--sv-mist)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        <strong>Message from employer:</strong>
                      </p>
                      <p style={{ margin: "var(--space-sm) 0 0 0" }}>
                        {request.message}
                      </p>
                    </div>
                  )}

                  <p className="form-help" style={{ marginTop: "var(--space-lg)" }}>
                    Received {formatDaysAgo(request.created_at)}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "var(--space-lg)",
                    paddingTop: "var(--space-lg)",
                    borderTop: "1px solid var(--sv-border-light)",
                    display: "flex",
                    gap: "var(--space-md)",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    onClick={() => handleAccept(request.id)}
                    disabled={respondingTo === request.id}
                  >
                    {respondingTo === request.id ? "Processing..." : "Accept Interview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(request.id)}
                    disabled={respondingTo === request.id}
                  >
                    Decline
                  </button>
                  {request.employer && (
                    <ReportButton
                      targetType="employer_profile"
                      targetId={request.employer.id}
                      targetName={
                        request.employer.employer_type === "company"
                          ? request.employer.company_name || request.employer.display_name
                          : request.employer.display_name
                      }
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Previous Responses */}
      {respondedRequests.length > 0 && (
        <section aria-label="Previous Responses">
          <h2>Previous Responses</h2>

          <div className="results-list">
            {respondedRequests.map((request) => (
              <article key={request.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p style={{ margin: 0 }}>
                      <strong>
                        {request.employer
                          ? request.employer.employer_type === "company"
                            ? request.employer.company_name || request.employer.display_name
                            : request.employer.display_name
                          : "Unknown Employer"}
                      </strong>
                    </p>
                    <p className="form-help" style={{ margin: 0 }}>
                      {request.proposed_date
                        ? new Date(request.proposed_date).toLocaleDateString()
                        : "Date not specified"}
                      {request.interview_type && ` - ${formatInterviewType(request.interview_type)}`}
                    </p>
                  </div>
                  <span
                    className={`cv-state ${
                      request.status === "accepted"
                        ? "cv-state-active"
                        : request.status === "completed"
                        ? "cv-state-active"
                        : "cv-state-draft"
                    }`}
                  >
                    {request.status === "accepted" ? "Accepted" :
                     request.status === "completed" ? "Completed" :
                     request.status === "cancelled" ? "Cancelled" : "Declined"}
                  </span>
                </div>

                {request.status === "accepted" && (
                  <p className="form-help" style={{ marginTop: "var(--space-md)" }}>
                    Your contact information has been shared with this employer.
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Privacy Notice */}
      <aside className="privacy-notice">
        <p>
          <strong>Privacy:</strong> Your email address and phone number are only
          shared with employers after you accept an interview request.
        </p>
      </aside>

      {/* Navigation */}
      <nav style={{ marginTop: "var(--space-xl)" }}>
        <Link href="/jobseeker/dashboard">Back to Dashboard</Link>
      </nav>
    </main>
  );
}
