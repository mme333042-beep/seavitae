"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getEmployerForReview } from "@/lib/supabase/admin";
import type { Employer, VerificationStatus } from "@/lib/supabase/types";

interface EmployerWithEmail extends Employer {
  email?: string;
}

export default function VerifyEmployerPage() {
  const router = useRouter();
  const params = useParams();
  const employerId = params.id as string;

  const [employer, setEmployer] = useState<EmployerWithEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployer() {
      if (!employerId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getEmployerForReview(employerId);
        if (!data) {
          setError("Employer not found or you don't have permission to view.");
          return;
        }
        setEmployer(data);
      } catch (err) {
        console.error("[Admin] Error loading employer:", err);
        setError("Failed to load employer details.");
      } finally {
        setLoading(false);
      }
    }

    loadEmployer();
  }, [employerId]);

  async function handleApprove() {
    if (!employer) return;

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerId: employer.id,
          action: 'approve',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to approve employer.");
        setActionLoading(false);
        return;
      }

      setSuccessMessage("Employer approved successfully! Approval email sent.");
      // Refresh employer data
      const updated = await getEmployerForReview(employerId);
      if (updated) setEmployer(updated);
      setActionLoading(false);
    } catch (err) {
      console.error('[Admin] Error approving employer:', err);
      setError("Failed to approve employer.");
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!employer) return;

    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerId: employer.id,
          action: 'reject',
          reason: rejectReason,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to reject employer.");
        setActionLoading(false);
        return;
      }

      setSuccessMessage("Employer rejected. Rejection email sent.");
      setShowRejectForm(false);
      setRejectReason("");
      // Refresh employer data
      const updated = await getEmployerForReview(employerId);
      if (updated) setEmployer(updated);
      setActionLoading(false);
    } catch (err) {
      console.error('[Admin] Error rejecting employer:', err);
      setError("Failed to reject employer.");
      setActionLoading(false);
    }
  }

  async function handleReset() {
    if (!employer) return;

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerId: employer.id,
          action: 'reset',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to reset verification status.");
        setActionLoading(false);
        return;
      }

      setSuccessMessage("Verification status reset to pending.");
      // Refresh employer data
      const updated = await getEmployerForReview(employerId);
      if (updated) setEmployer(updated);
      setActionLoading(false);
    } catch (err) {
      console.error('[Admin] Error resetting verification:', err);
      setError("Failed to reset verification status.");
      setActionLoading(false);
    }
  }

  function getStatusBadge(status: VerificationStatus) {
    const styles: Record<VerificationStatus, { bg: string; color: string }> = {
      pending: { bg: "var(--sv-warning-bg)", color: "var(--sv-warning)" },
      approved: { bg: "var(--sv-success-bg)", color: "var(--sv-success)" },
      rejected: { bg: "var(--sv-error-bg)", color: "var(--sv-error)" },
    };
    const style = styles[status];
    return (
      <span
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: "var(--space-xs) var(--space-md)",
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--text-base)",
          fontWeight: 600,
          textTransform: "capitalize",
        }}
      >
        {status}
      </span>
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main>
        <p>Loading employer details...</p>
      </main>
    );
  }

  if (error && !employer) {
    return (
      <main>
        <section>
          <Link href="/admin" className="back-link">
            Back to Dashboard
          </Link>
          <h1>Error</h1>
          <div role="alert" style={{ color: "var(--sv-error)" }}>
            {error}
          </div>
        </section>
      </main>
    );
  }

  if (!employer) {
    return (
      <main>
        <section>
          <Link href="/admin" className="back-link">
            Back to Dashboard
          </Link>
          <h1>Employer Not Found</h1>
          <p>The requested employer could not be found.</p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section>
        <Link href="/admin" className="back-link">
          Back to Dashboard
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-lg)" }}>
          <div>
            <h1 style={{ marginBottom: "var(--space-xs)" }}>
              {employer.employer_type === "company"
                ? employer.company_name
                : employer.display_name}
            </h1>
            <p style={{ color: "var(--sv-muted)", margin: 0 }}>
              {employer.employer_type === "company" ? "Company" : "Individual"} Employer
            </p>
          </div>
          {getStatusBadge(employer.verification_status)}
        </div>

        {successMessage && (
          <div role="status" className="alert alert-success">
            {successMessage}
          </div>
        )}

        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        {/* Employer Details */}
        <div className="card">
          <h2>Verification Details</h2>

          <div className="detail-grid">
            <div className="detail-section">
              <h3>Contact Information</h3>
              <dl>
                <dt>Email</dt>
                <dd>{employer.email || "Not available"}</dd>
                <dt>Display Name</dt>
                <dd>{employer.display_name}</dd>
                <dt>Phone</dt>
                <dd>{employer.phone || "Not provided"}</dd>
                <dt>Address</dt>
                <dd>{employer.address || "Not provided"}</dd>
                <dt>City</dt>
                <dd>{employer.city || "Not provided"}</dd>
                {employer.linkedin_url && (
                  <>
                    <dt>LinkedIn</dt>
                    <dd>
                      <a href={employer.linkedin_url} target="_blank" rel="noopener noreferrer">
                        {employer.linkedin_url}
                      </a>
                    </dd>
                  </>
                )}
              </dl>
            </div>

            {employer.employer_type === "company" ? (
              <div className="detail-section">
                <h3>Company Information</h3>
                <dl>
                  <dt>Company Name</dt>
                  <dd>{employer.company_name || "Not provided"}</dd>
                  <dt>CAC Registration Number</dt>
                  <dd style={{ fontWeight: 600 }}>
                    {employer.cac_registration_number || (
                      <span style={{ color: "var(--sv-error)" }}>NOT PROVIDED</span>
                    )}
                  </dd>
                  <dt>Industry</dt>
                  <dd>{employer.industry || "Not provided"}</dd>
                  <dt>Company Size</dt>
                  <dd>{employer.company_size || "Not provided"}</dd>
                  <dt>Website</dt>
                  <dd>
                    {employer.website ? (
                      <a href={employer.website} target="_blank" rel="noopener noreferrer">
                        {employer.website}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </dd>
                </dl>
              </div>
            ) : (
              <div className="detail-section">
                <h3>Individual Information</h3>
                <dl>
                  <dt>NIN / Passport Number</dt>
                  <dd style={{ fontWeight: 600 }}>
                    {employer.nin_passport_number || (
                      <span style={{ color: "var(--sv-error)" }}>NOT PROVIDED</span>
                    )}
                  </dd>
                  <dt>Hiring Purpose</dt>
                  <dd>
                    {employer.hiring_purpose
                      ? employer.hiring_purpose.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                      : "Not provided"}
                  </dd>
                  {employer.bio && (
                    <>
                      <dt>Additional Info</dt>
                      <dd>{employer.bio}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>

          <div className="detail-section" style={{ marginTop: "var(--space-lg)" }}>
            <h3>Account Information</h3>
            <dl>
              <dt>Registered</dt>
              <dd>{formatDate(employer.created_at)}</dd>
              <dt>Last Updated</dt>
              <dd>{formatDate(employer.updated_at)}</dd>
              {employer.verification_date && (
                <>
                  <dt>Verification Date</dt>
                  <dd>{formatDate(employer.verification_date)}</dd>
                </>
              )}
              {employer.verification_notes && (
                <>
                  <dt>Verification Notes</dt>
                  <dd>{employer.verification_notes}</dd>
                </>
              )}
            </dl>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card" style={{ marginTop: "var(--space-lg)" }}>
          <h2>Verification Actions</h2>

          {employer.verification_status === "pending" && (
            <div className="action-buttons">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="btn btn-success"
              >
                {actionLoading ? "Processing..." : "Approve Employer"}
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={actionLoading}
                className="btn btn-danger"
              >
                Reject
              </button>
            </div>
          )}

          {employer.verification_status === "approved" && (
            <div className="action-buttons">
              <p style={{ color: "var(--sv-success)", marginBottom: "var(--space-md)" }}>
                This employer has been approved and can access the platform.
              </p>
              <button
                onClick={handleReset}
                disabled={actionLoading}
                className="btn btn-secondary"
              >
                {actionLoading ? "Processing..." : "Reset to Pending"}
              </button>
            </div>
          )}

          {employer.verification_status === "rejected" && (
            <div className="action-buttons">
              <p style={{ color: "var(--sv-error)", marginBottom: "var(--space-md)" }}>
                This employer has been rejected.
              </p>
              <button
                onClick={handleReset}
                disabled={actionLoading}
                className="btn btn-secondary"
              >
                {actionLoading ? "Processing..." : "Reset to Pending"}
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="btn btn-success"
              >
                {actionLoading ? "Processing..." : "Approve Employer"}
              </button>
            </div>
          )}

          {showRejectForm && (
            <div className="reject-form" style={{ marginTop: "var(--space-lg)" }}>
              <h3>Rejection Reason</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection (required)"
                rows={4}
                style={{ width: "100%", marginBottom: "var(--space-md)" }}
              />
              <div className="action-buttons">
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="btn btn-danger"
                >
                  {actionLoading ? "Processing..." : "Confirm Rejection"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason("");
                  }}
                  disabled={actionLoading}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
        }
        .detail-section h3 {
          margin-top: 0;
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-sm);
          border-bottom: 1px solid var(--sv-border-light);
        }
        .detail-section dl {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: var(--space-sm) var(--space-lg);
          margin: 0;
        }
        .detail-section dt {
          font-weight: 500;
          color: var(--sv-navy);
          font-size: var(--text-sm);
          margin: 0;
        }
        .detail-section dd {
          margin: 0;
          color: var(--sv-body);
        }
        .action-buttons {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-sm) var(--space-xl);
          font-size: var(--text-base);
          font-weight: 500;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-success {
          background-color: var(--sv-success);
          color: var(--sv-white);
        }
        .btn-success:hover:not(:disabled) {
          background-color: #14532d;
        }
        .btn-danger {
          background-color: var(--sv-error);
          color: var(--sv-white);
        }
        .btn-danger:hover:not(:disabled) {
          background-color: #7f1d1d;
        }
        .btn-secondary {
          background-color: var(--sv-white);
          color: var(--sv-ocean);
          border: 1px solid var(--sv-ocean);
        }
        .btn-secondary:hover:not(:disabled) {
          background-color: var(--sv-mist);
        }
      `}</style>
    </main>
  );
}
