"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getPlatformStats,
  getVerificationFunnel,
  getInterviewStats,
  getRecentActivity,
  getSavedCVsStats,
  type PlatformStats,
} from "@/lib/supabase/adminAnalytics";

interface AnalyticsData {
  platformStats: PlatformStats | null;
  verificationFunnel: {
    pendingEmployers: number;
    approvedEmployers: number;
    rejectedEmployers: number;
    avgApprovalTimeHours: number | null;
  } | null;
  interviewStats: {
    pending: number;
    accepted: number;
    declined: number;
    completed: number;
    total: number;
  } | null;
  recentActivity: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newCVsToday: number;
    newCVsThisWeek: number;
    newInterviewsToday: number;
    newInterviewsThisWeek: number;
  } | null;
  savedCVsStats: {
    totalSaved: number;
    uniqueEmployersSaving: number;
    uniqueJobseekersSaved: number;
  } | null;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    platformStats: null,
    verificationFunnel: null,
    interviewStats: null,
    recentActivity: null,
    savedCVsStats: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all analytics data in parallel
        const [platformStats, verificationFunnel, interviewStats, recentActivity, savedCVsStats] =
          await Promise.all([
            getPlatformStats(),
            getVerificationFunnel(),
            getInterviewStats(),
            getRecentActivity(),
            getSavedCVsStats(),
          ]);

        setData({
          platformStats,
          verificationFunnel,
          interviewStats,
          recentActivity,
          savedCVsStats,
        });
      } catch (err) {
        console.error("[AdminAnalytics] Error loading analytics:", err);
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <main>
        <p>Loading analytics...</p>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Platform Analytics</h1>
        <p style={{ marginBottom: "var(--space-lg)" }}>
          Read-only view of platform metrics from Supabase.{" "}
          <Link href="/admin">Back to Dashboard</Link>
        </p>

        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        {/* Platform Overview */}
        {data.platformStats && (
          <div className="analytics-section">
            <h2>Platform Overview</h2>
            <div className="stats-grid">
              <StatCard
                label="Total Users"
                value={data.platformStats.totalUsers}
                variant="default"
              />
              <StatCard
                label="Jobseekers"
                value={data.platformStats.jobseekers}
                variant="ocean"
              />
              <StatCard
                label="Employers"
                value={data.platformStats.employers}
                variant="ocean"
              />
              <StatCard
                label="CVs Created"
                value={data.platformStats.cvsCreated}
                variant="default"
              />
              <StatCard
                label="CVs Visible"
                value={data.platformStats.cvsVisible}
                variant="success"
              />
              <StatCard
                label="Interviews"
                value={data.platformStats.interviewsRequested}
                variant="default"
              />
              <StatCard
                label="Messages"
                value={data.platformStats.messagesSent}
                variant="default"
              />
              <StatCard
                label="Invites Used"
                value={`${data.platformStats.invitesUsed}/${data.platformStats.invitesCreated}`}
                variant="default"
              />
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {data.recentActivity && (
          <div className="analytics-section">
            <h2>Recent Activity</h2>
            <div className="activity-grid">
              <div className="activity-card">
                <h3>New Users</h3>
                <div className="activity-row">
                  <span>Today</span>
                  <strong>{data.recentActivity.newUsersToday}</strong>
                </div>
                <div className="activity-row">
                  <span>This Week</span>
                  <strong>{data.recentActivity.newUsersThisWeek}</strong>
                </div>
              </div>
              <div className="activity-card">
                <h3>New CVs</h3>
                <div className="activity-row">
                  <span>Today</span>
                  <strong>{data.recentActivity.newCVsToday}</strong>
                </div>
                <div className="activity-row">
                  <span>This Week</span>
                  <strong>{data.recentActivity.newCVsThisWeek}</strong>
                </div>
              </div>
              <div className="activity-card">
                <h3>New Interviews</h3>
                <div className="activity-row">
                  <span>Today</span>
                  <strong>{data.recentActivity.newInterviewsToday}</strong>
                </div>
                <div className="activity-row">
                  <span>This Week</span>
                  <strong>{data.recentActivity.newInterviewsThisWeek}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employer Verification Funnel */}
        {data.verificationFunnel && (
          <div className="analytics-section">
            <h2>Employer Verification</h2>
            <div className="stats-grid">
              <StatCard
                label="Pending"
                value={data.verificationFunnel.pendingEmployers}
                variant="warning"
              />
              <StatCard
                label="Approved"
                value={data.verificationFunnel.approvedEmployers}
                variant="success"
              />
              <StatCard
                label="Rejected"
                value={data.verificationFunnel.rejectedEmployers}
                variant="error"
              />
              <StatCard
                label="Avg Approval Time"
                value={
                  data.verificationFunnel.avgApprovalTimeHours !== null
                    ? `${data.verificationFunnel.avgApprovalTimeHours}h`
                    : "N/A"
                }
                variant="default"
              />
            </div>
          </div>
        )}

        {/* Interview Statistics */}
        {data.interviewStats && (
          <div className="analytics-section">
            <h2>Interview Breakdown</h2>
            <div className="stats-grid">
              <StatCard
                label="Pending"
                value={data.interviewStats.pending}
                variant="warning"
              />
              <StatCard
                label="Accepted"
                value={data.interviewStats.accepted}
                variant="success"
              />
              <StatCard
                label="Declined"
                value={data.interviewStats.declined}
                variant="error"
              />
              <StatCard
                label="Completed"
                value={data.interviewStats.completed}
                variant="ocean"
              />
            </div>
          </div>
        )}

        {/* Employer Engagement */}
        {data.savedCVsStats && (
          <div className="analytics-section">
            <h2>Employer Engagement</h2>
            <div className="stats-grid">
              <StatCard
                label="CVs Saved"
                value={data.savedCVsStats.totalSaved}
                variant="default"
              />
              <StatCard
                label="Employers Saving"
                value={data.savedCVsStats.uniqueEmployersSaving}
                variant="ocean"
              />
              <StatCard
                label="Jobseekers Saved"
                value={data.savedCVsStats.uniqueJobseekersSaved}
                variant="success"
              />
            </div>
          </div>
        )}
      </section>

      <style jsx>{`
        .analytics-section {
          margin-bottom: var(--space-2xl);
        }
        .analytics-section h2 {
          margin-bottom: var(--space-md);
          font-size: var(--text-lg);
          color: var(--sv-navy);
          border-bottom: 1px solid var(--sv-border-light);
          padding-bottom: var(--space-sm);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--space-md);
        }
        .activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
        }
        .activity-card {
          background-color: var(--sv-white);
          border: 1px solid var(--sv-border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }
        .activity-card h3 {
          margin: 0 0 var(--space-md) 0;
          font-size: var(--text-base);
          color: var(--sv-navy);
        }
        .activity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-xs) 0;
          border-bottom: 1px solid var(--sv-border-light);
        }
        .activity-row:last-child {
          border-bottom: none;
        }
        .activity-row span {
          color: var(--sv-muted);
          font-size: var(--text-sm);
        }
        .activity-row strong {
          color: var(--sv-navy);
          font-size: var(--text-lg);
        }
      `}</style>
    </main>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number | string;
  variant?: "default" | "ocean" | "success" | "warning" | "error";
}) {
  const variantStyles: Record<string, { color: string }> = {
    default: { color: "var(--sv-navy)" },
    ocean: { color: "var(--sv-ocean)" },
    success: { color: "var(--sv-success)" },
    warning: { color: "var(--sv-warning)" },
    error: { color: "var(--sv-error)" },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color: style.color }}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
      <style jsx>{`
        .stat-card {
          background-color: var(--sv-white);
          border: 1px solid var(--sv-border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          text-align: center;
        }
        .stat-value {
          font-size: var(--text-2xl);
          font-weight: 700;
          margin-bottom: var(--space-xs);
        }
        .stat-label {
          font-size: var(--text-sm);
          color: var(--sv-muted);
        }
      `}</style>
    </div>
  );
}
