"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getVerificationStats,
  getEmployersByStatus,
  getAllEmployersWithEmails,
} from "@/lib/supabase/admin";
import type { Employer, VerificationStatus } from "@/lib/supabase/types";

interface EmployerWithEmail extends Employer {
  email?: string;
}

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") as VerificationStatus | null;

  const [stats, setStats] = useState<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  } | null>(null);
  const [employers, setEmployers] = useState<EmployerWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Load stats
        const statsData = await getVerificationStats();
        if (statsData) {
          setStats(statsData);
        }

        // Load employers based on filter
        let employersData: EmployerWithEmail[];
        if (statusFilter) {
          employersData = await getEmployersByStatus(statusFilter);
        } else {
          employersData = await getAllEmployersWithEmails();
        }
        setEmployers(employersData);
      } catch (err) {
        console.error("[Admin] Error loading data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [statusFilter]);

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
          padding: "var(--space-xs) var(--space-sm)",
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main>
        <p>Loading admin dashboard...</p>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Admin Dashboard</h1>
        <p>Manage employer verifications and platform settings.</p>

        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <Link
              href="/admin?status=pending"
              className="stat-card stat-pending"
            >
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending Review</div>
            </Link>
            <Link
              href="/admin?status=approved"
              className="stat-card stat-approved"
            >
              <div className="stat-number">{stats.approved}</div>
              <div className="stat-label">Approved</div>
            </Link>
            <Link
              href="/admin?status=rejected"
              className="stat-card stat-rejected"
            >
              <div className="stat-number">{stats.rejected}</div>
              <div className="stat-label">Rejected</div>
            </Link>
            <Link href="/admin" className="stat-card stat-total">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Employers</div>
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2>
          {statusFilter
            ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Employers`
            : "All Employers"}
        </h2>

        {statusFilter && (
          <p style={{ marginBottom: "var(--space-lg)" }}>
            <Link href="/admin">View all employers</Link>
          </p>
        )}

        {employers.length === 0 ? (
          <div className="empty-state">
            <p>No employers found{statusFilter ? ` with ${statusFilter} status` : ""}.</p>
          </div>
        ) : (
          <div className="employer-list">
            {employers.map((employer) => (
              <div key={employer.id} className="employer-card">
                <div className="employer-header">
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {employer.employer_type === "company"
                        ? employer.company_name
                        : employer.display_name}
                    </h3>
                    <p
                      style={{
                        margin: "var(--space-xs) 0 0 0",
                        color: "var(--sv-muted)",
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {employer.employer_type === "company"
                        ? "Company"
                        : "Individual"}{" "}
                      {employer.email && `- ${employer.email}`}
                    </p>
                  </div>
                  {getStatusBadge(employer.verification_status)}
                </div>

                <div className="employer-details">
                  <dl>
                    {employer.employer_type === "company" && (
                      <>
                        <dt>CAC Number</dt>
                        <dd>{employer.cac_registration_number || "Not provided"}</dd>
                        <dt>Industry</dt>
                        <dd>{employer.industry || "Not provided"}</dd>
                        <dt>Website</dt>
                        <dd>
                          {employer.website ? (
                            <a
                              href={employer.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {employer.website}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </dd>
                      </>
                    )}
                    {employer.employer_type === "individual" && (
                      <>
                        <dt>NIN/Passport</dt>
                        <dd>{employer.nin_passport_number || "Not provided"}</dd>
                        <dt>Hiring Purpose</dt>
                        <dd>
                          {employer.hiring_purpose
                            ? employer.hiring_purpose.replace(/_/g, " ")
                            : "Not provided"}
                        </dd>
                      </>
                    )}
                    <dt>Phone</dt>
                    <dd>{employer.phone || "Not provided"}</dd>
                    <dt>Location</dt>
                    <dd>
                      {employer.city || employer.address
                        ? `${employer.address || ""} ${employer.city || ""}`.trim()
                        : "Not provided"}
                    </dd>
                    <dt>Registered</dt>
                    <dd>{formatDate(employer.created_at)}</dd>
                  </dl>
                </div>

                {employer.verification_notes && (
                  <div
                    className="verification-notes"
                    style={{
                      marginTop: "var(--space-md)",
                      padding: "var(--space-sm)",
                      backgroundColor: "var(--sv-mist)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    <strong>Notes:</strong> {employer.verification_notes}
                  </div>
                )}

                <div className="employer-actions">
                  <Link href={`/admin/verify/${employer.id}`} className="btn">
                    Review Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }
        .stat-card {
          display: block;
          background-color: var(--sv-white);
          border: 1px solid var(--sv-border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          text-align: center;
          text-decoration: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .stat-card:hover {
          border-color: var(--sv-ocean);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          text-decoration: none;
        }
        .stat-number {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--sv-navy);
        }
        .stat-label {
          font-size: var(--text-sm);
          color: var(--sv-muted);
          margin-top: var(--space-xs);
        }
        .stat-pending .stat-number {
          color: var(--sv-warning);
        }
        .stat-approved .stat-number {
          color: var(--sv-success);
        }
        .stat-rejected .stat-number {
          color: var(--sv-error);
        }
        .employer-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .employer-card {
          background-color: var(--sv-white);
          border: 1px solid var(--sv-border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }
        .employer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-md);
        }
        .employer-details dl {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: var(--space-xs) var(--space-lg);
          margin: 0;
        }
        .employer-details dt {
          font-weight: 500;
          color: var(--sv-navy);
          font-size: var(--text-sm);
          margin: 0;
        }
        .employer-details dd {
          margin: 0;
          color: var(--sv-body);
          font-size: var(--text-sm);
        }
        .employer-actions {
          margin-top: var(--space-lg);
          padding-top: var(--space-md);
          border-top: 1px solid var(--sv-border-light);
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-sm) var(--space-lg);
          font-size: var(--text-sm);
          font-weight: 500;
          border-radius: var(--radius-md);
          background-color: var(--sv-ocean);
          color: var(--sv-white);
          text-decoration: none;
        }
        .btn:hover {
          background-color: var(--sv-ocean-dark);
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}
