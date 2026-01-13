"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getMyEmployerProfile } from "@/lib/supabase/services/employers";
import {
  getMyInterviewsAsEmployer,
  cancelInterview,
  deleteInterview,
} from "@/lib/supabase/services/interviews";
import type { Interview, Employer, Jobseeker } from "@/lib/supabase/types";

interface InterviewWithJobseeker extends Interview {
  jobseeker?: Jobseeker;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not specified";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "var(--color-warning-border, #ffc107)";
    case "accepted":
      return "var(--color-success-border, #28a745)";
    case "declined":
    case "cancelled":
      return "var(--color-error-border, #dc3545)";
    case "completed":
      return "var(--sv-ocean)";
    default:
      return "var(--sv-border-light)";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending Response";
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export default function EmployerInterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewWithJobseeker[]>([]);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          router.push("/employer");
          return;
        }

        if (userProfile.role !== "employer") {
          router.push("/jobseeker/dashboard");
          return;
        }

        const employerProfile = await getMyEmployerProfile();
        if (!employerProfile) {
          router.push("/employer");
          return;
        }

        setEmployer(employerProfile);

        // Fetch interviews
        const interviewsData = await getMyInterviewsAsEmployer();
        setInterviews(interviewsData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading interviews:", err);
        setError("Failed to load interviews. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  async function handleCancel(interviewId: string) {
    if (!confirm("Are you sure you want to cancel this interview request?")) {
      return;
    }

    setActionInProgress(interviewId);
    setError(null);

    try {
      const result = await cancelInterview(interviewId);

      if (!result.success) {
        setError(result.error || "Failed to cancel interview");
        setActionInProgress(null);
        return;
      }

      // Update local state
      setInterviews((prev) =>
        prev.map((int) =>
          int.id === interviewId ? { ...int, status: "cancelled" } : int
        )
      );
      setActionInProgress(null);
    } catch (err) {
      console.error("Error cancelling interview:", err);
      setError("Failed to cancel interview. Please try again.");
      setActionInProgress(null);
    }
  }

  async function handleDelete(interviewId: string) {
    if (!confirm("Are you sure you want to delete this interview request? This cannot be undone.")) {
      return;
    }

    setActionInProgress(interviewId);
    setError(null);

    try {
      const result = await deleteInterview(interviewId);

      if (!result.success) {
        setError(result.error || "Failed to delete interview");
        setActionInProgress(null);
        return;
      }

      // Remove from local state
      setInterviews((prev) => prev.filter((int) => int.id !== interviewId));
      setActionInProgress(null);
    } catch (err) {
      console.error("Error deleting interview:", err);
      setError("Failed to delete interview. Please try again.");
      setActionInProgress(null);
    }
  }

  // Categorize interviews
  const pendingInterviews = interviews.filter((i) => i.status === "pending");
  const acceptedInterviews = interviews.filter((i) => i.status === "accepted");
  const otherInterviews = interviews.filter(
    (i) => !["pending", "accepted"].includes(i.status)
  );

  if (loading) {
    return (
      <main>
        <p>Loading interviews...</p>
      </main>
    );
  }

  return (
    <main>
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Scheduled Interviews</h1>
          <p>Manage your interview requests and scheduled meetings.</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="user-info">
            <strong>{employer?.display_name || "Employer"}</strong>
            <br />
            <span>{employer?.employer_type === "company" ? employer.company_name || "Company" : "Individual"}</span>
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

      {/* Verification Notice for unverified employers */}
      {employer && !employer.is_verified && (
        <div
          role="status"
          style={{
            marginBottom: "var(--space-lg)",
            padding: "var(--space-md)",
            backgroundColor: "var(--color-warning-bg, #fff3cd)",
            border: "1px solid var(--color-warning-border, #ffc107)",
            borderRadius: "var(--radius-md, 4px)",
          }}
        >
          <strong>Account Pending Verification</strong>
          <p style={{ margin: "var(--space-sm) 0 0 0" }}>
            You can view your interview history here, but you need account verification to send new interview requests.
          </p>
        </div>
      )}

      {/* No interviews */}
      {interviews.length === 0 && (
        <div className="card empty-state">
          <p>
            <strong>No interview requests yet.</strong>
          </p>
          <p>
            When you request interviews with candidates, they will appear here.
            You can track pending requests, accepted interviews, and your interview history.
          </p>
          <p style={{ marginTop: "var(--space-lg)" }}>
            <Link href="/employer/dashboard">Search for candidates</Link>
          </p>
        </div>
      )}

      {/* Accepted Interviews - Show first as these are most important */}
      {acceptedInterviews.length > 0 && (
        <section aria-label="Accepted Interviews">
          <h2>Accepted Interviews ({acceptedInterviews.length})</h2>

          <div className="results-list">
            {acceptedInterviews.map((interview) => (
              <article key={interview.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {interview.jobseeker?.full_name || "Unknown Candidate"}
                    </h3>
                    <p className="form-help" style={{ margin: "var(--space-xs) 0 0 0" }}>
                      {interview.jobseeker?.preferred_role || "No role specified"}
                      {interview.jobseeker?.city && ` - ${interview.jobseeker.city}`}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "var(--space-xs) var(--space-sm)",
                      backgroundColor: getStatusColor(interview.status),
                      color: "white",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {getStatusLabel(interview.status)}
                  </span>
                </div>

                <div style={{ marginTop: "var(--space-lg)" }}>
                  <dl>
                    <dt>Interview Type</dt>
                    <dd>{formatInterviewType(interview.interview_type)}</dd>

                    {interview.proposed_date && (
                      <>
                        <dt>Date & Time</dt>
                        <dd>{formatDate(interview.proposed_date)}</dd>
                      </>
                    )}

                    {interview.proposed_location && (
                      <>
                        <dt>Location</dt>
                        <dd>{interview.proposed_location}</dd>
                      </>
                    )}
                  </dl>
                </div>

                {interview.response_message && (
                  <div
                    style={{
                      marginTop: "var(--space-md)",
                      padding: "var(--space-md)",
                      backgroundColor: "var(--color-success-bg, #d4edda)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>Candidate&apos;s response:</strong>
                    </p>
                    <p style={{ margin: "var(--space-sm) 0 0 0" }}>
                      {interview.response_message}
                    </p>
                  </div>
                )}

                {/* Contact info available after acceptance */}
                {interview.jobseeker && (
                  <div
                    style={{
                      marginTop: "var(--space-md)",
                      padding: "var(--space-md)",
                      backgroundColor: "var(--sv-mist)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>Contact Information:</strong>
                    </p>
                    {interview.jobseeker.phone && (
                      <p style={{ margin: "var(--space-sm) 0 0 0" }}>
                        Phone: {interview.jobseeker.phone}
                      </p>
                    )}
                    <p style={{ margin: "var(--space-sm) 0 0 0" }}>
                      <Link href={`/messages?to=${interview.jobseeker.id}`}>
                        Send a message
                      </Link>
                    </p>
                  </div>
                )}

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
                  <Link href={`/cv/${interview.jobseeker_id}`} className="btn btn-secondary">
                    View Profile
                  </Link>
                  <Link href={`/cv/${interview.jobseeker_id}/message`} className="btn btn-secondary">
                    Message
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Pending Interviews */}
      {pendingInterviews.length > 0 && (
        <section aria-label="Pending Interview Requests">
          <h2>Pending Requests ({pendingInterviews.length})</h2>

          <div className="results-list">
            {pendingInterviews.map((interview) => (
              <article key={interview.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {interview.jobseeker?.full_name || "Unknown Candidate"}
                    </h3>
                    <p className="form-help" style={{ margin: "var(--space-xs) 0 0 0" }}>
                      {interview.jobseeker?.preferred_role || "No role specified"}
                      {interview.jobseeker?.city && ` - ${interview.jobseeker.city}`}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "var(--space-xs) var(--space-sm)",
                      backgroundColor: getStatusColor(interview.status),
                      color: "black",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {getStatusLabel(interview.status)}
                  </span>
                </div>

                <div style={{ marginTop: "var(--space-lg)" }}>
                  <dl>
                    <dt>Interview Type</dt>
                    <dd>{formatInterviewType(interview.interview_type)}</dd>

                    {interview.proposed_date && (
                      <>
                        <dt>Proposed Date</dt>
                        <dd>{formatDate(interview.proposed_date)}</dd>
                      </>
                    )}

                    {interview.proposed_location && (
                      <>
                        <dt>Proposed Location</dt>
                        <dd>{interview.proposed_location}</dd>
                      </>
                    )}
                  </dl>
                </div>

                {interview.message && (
                  <div
                    style={{
                      marginTop: "var(--space-md)",
                      padding: "var(--space-md)",
                      backgroundColor: "var(--sv-mist)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>Your message:</strong>
                    </p>
                    <p style={{ margin: "var(--space-sm) 0 0 0" }}>
                      {interview.message}
                    </p>
                  </div>
                )}

                <p className="form-help" style={{ marginTop: "var(--space-md)" }}>
                  Sent {new Date(interview.created_at).toLocaleDateString()}
                </p>

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
                  <Link href={`/cv/${interview.jobseeker_id}`} className="btn btn-secondary">
                    View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleCancel(interview.id)}
                    disabled={actionInProgress === interview.id}
                    className="btn-secondary"
                    style={{ color: "var(--color-error)" }}
                  >
                    {actionInProgress === interview.id ? "Cancelling..." : "Cancel Request"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Past Interviews */}
      {otherInterviews.length > 0 && (
        <section aria-label="Interview History">
          <h2>Interview History ({otherInterviews.length})</h2>

          <div className="results-list">
            {otherInterviews.map((interview) => (
              <article key={interview.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0 }}>
                      <strong>{interview.jobseeker?.full_name || "Unknown Candidate"}</strong>
                    </p>
                    <p className="form-help" style={{ margin: 0 }}>
                      {interview.proposed_date
                        ? formatDate(interview.proposed_date)
                        : "Date not specified"}
                      {interview.interview_type && ` - ${formatInterviewType(interview.interview_type)}`}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "var(--space-xs) var(--space-sm)",
                      backgroundColor: getStatusColor(interview.status),
                      color: interview.status === "completed" ? "white" : "white",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {getStatusLabel(interview.status)}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "var(--space-md)",
                    display: "flex",
                    gap: "var(--space-md)",
                    flexWrap: "wrap",
                  }}
                >
                  <Link href={`/cv/${interview.jobseeker_id}`} className="btn btn-secondary">
                    View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(interview.id)}
                    disabled={actionInProgress === interview.id}
                    className="btn-secondary"
                    style={{ color: "var(--color-error)" }}
                  >
                    {actionInProgress === interview.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Privacy Notice */}
      <aside className="privacy-notice">
        <p>
          <strong>Contact Privacy:</strong> Candidate contact information (phone number)
          is only visible after they accept your interview request.
        </p>
      </aside>

      {/* Navigation */}
      <nav style={{ marginTop: "var(--space-xl)" }}>
        <Link href="/employer/dashboard">Back to Dashboard</Link>
      </nav>
    </main>
  );
}
