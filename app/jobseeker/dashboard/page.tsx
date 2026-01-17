"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, getCurrentUserWithProfile } from "@/lib/supabase/auth";
import {
  getMyJobseekerProfile,
  getMyCV,
  setVisibility,
} from "@/lib/supabase/services/jobseekers";
import { getUnreadCount } from "@/lib/supabase/services/messages";
import { getPendingInterviewCount } from "@/lib/supabase/services/interviews";
import { downloadCVAsPDF, isPrintAvailable, CVData } from "@/lib/pdfGenerator";
import NotificationBadge from "@/components/NotificationBadge";
import type { Jobseeker, CV, CVSection } from "@/lib/supabase/types";

function formatLastUpdated(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function getCVStateLabel(isVisible: boolean, isLocked: boolean): string {
  if (isVisible && isLocked) return "Active (Locked)";
  if (isVisible) return "Active";
  return "Draft";
}

function buildCVData(jobseeker: Jobseeker, sections: CVSection[]): CVData {
  // Extract data from CV sections
  const experienceSection = sections.find(s => s.section_type === "experience");
  const educationSection = sections.find(s => s.section_type === "education");
  const skillsSection = sections.find(s => s.section_type === "skills");
  const languagesSection = sections.find(s => s.section_type === "languages");
  const certificationsSection = sections.find(s => s.section_type === "certifications");
  const projectsSection = sections.find(s => s.section_type === "projects");
  const publicationsSection = sections.find(s => s.section_type === "publications");

  const getItems = (section: CVSection | undefined) => {
    if (!section?.content) return [];
    const content = section.content as { items?: unknown[] };
    return content.items || [];
  };

  return {
    fullName: jobseeker.full_name,
    city: jobseeker.city || "",
    preferredRole: jobseeker.preferred_role || "",
    bio: jobseeker.bio || "",
    skills: getItems(skillsSection).map((s: unknown) => (s as { name: string }).name || String(s)),
    experience: getItems(experienceSection).map((e: unknown) => {
      const exp = e as { title?: string; company?: string; location?: string; startDate?: string; endDate?: string; description?: string };
      return {
        title: exp.title || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "Present",
        description: exp.description || "",
      };
    }),
    education: getItems(educationSection).map((e: unknown) => {
      const edu = e as { degree?: string; institution?: string; location?: string; graduationYear?: number };
      return {
        degree: edu.degree || "",
        institution: edu.institution || "",
        location: edu.location || "",
        year: edu.graduationYear || 0,
      };
    }),
    languages: getItems(languagesSection).map((l: unknown) => {
      const lang = l as { name?: string; proficiency?: string };
      return {
        language: lang.name || "",
        proficiency: lang.proficiency || "",
      };
    }),
    certifications: getItems(certificationsSection).map((c: unknown) => {
      const cert = c as { name?: string; issuer?: string; issueDate?: string };
      return {
        name: cert.name || "",
        issuer: cert.issuer || "",
        year: parseInt(cert.issueDate || "0") || 0,
      };
    }),
    projects: getItems(projectsSection).map((p: unknown) => {
      const proj = p as { name?: string; description?: string; url?: string };
      return {
        name: proj.name || "",
        description: proj.description || "",
        link: proj.url || "",
      };
    }),
    publications: getItems(publicationsSection).map((p: unknown) => {
      const pub = p as { title?: string; publisher?: string; url?: string };
      return {
        title: pub.title || "",
        venue: pub.publisher || "",
        link: pub.url || "",
      };
    }),
    lastUpdated: new Date(jobseeker.updated_at),
  };
}

export default function JobseekerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobseeker, setJobseeker] = useState<Jobseeker | null>(null);
  const [cv, setCV] = useState<CV | null>(null);
  const [sections, setSections] = useState<CVSection[]>([]);
  const [editLocked, setEditLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingInterviews, setPendingInterviews] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          // Not authenticated - redirect to signup
          router.push("/jobseeker/signup");
          return;
        }

        if (userProfile.role !== "jobseeker") {
          // Wrong role - redirect to correct dashboard
          router.push("/employer/dashboard");
          return;
        }

        const profile = await getMyJobseekerProfile();
        if (!profile) {
          // Redirect to create profile
          router.push("/jobseeker/create-profile");
          return;
        }

        setJobseeker(profile);

        // Get CV data
        const cvData = await getMyCV();
        if (cvData && cvData.cv) {
          setCV(cvData.cv);
          setSections(cvData.sections);
          setEditLocked(cvData.cv.is_locked);
        }

        // Fetch notification counts
        const [messageCount, interviewCount] = await Promise.all([
          getUnreadCount(),
          getPendingInterviewCount(),
        ]);
        setUnreadMessages(messageCount);
        setPendingInterviews(interviewCount);

        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard");
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  async function handleToggleVisibility() {
    if (!jobseeker) return;

    setTogglingVisibility(true);
    setError(null);

    const newVisibility = !jobseeker.is_visible;

    try {
      const result = await setVisibility(jobseeker.id, newVisibility);
      if (!result.success) {
        setError(result.error || "Failed to update visibility");
        setTogglingVisibility(false);
        return;
      }

      // Update local state
      setJobseeker(prev => prev ? { ...prev, is_visible: newVisibility } : null);
      setEditLocked(newVisibility);

      // Also update CV lock status
      if (cv) {
        setCV(prev => prev ? { ...prev, is_locked: newVisibility } : null);
      }

      setTogglingVisibility(false);
    } catch (err) {
      console.error("Error toggling visibility:", err);
      setError("Failed to update visibility");
      setTogglingVisibility(false);
    }
  }

  function handleDownloadPDF() {
    if (!jobseeker) return;

    if (isPrintAvailable()) {
      const cvData = buildCVData(jobseeker, sections);
      downloadCVAsPDF(cvData);
    } else {
      alert("PDF download is not available in this browser.");
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (!jobseeker) {
    return (
      <main>
        <p>Profile not found. <Link href="/jobseeker/create-profile">Create one now</Link>.</p>
      </main>
    );
  }

  const lastUpdated = new Date(jobseeker.updated_at);
  const isVisible = jobseeker.is_visible;

  return (
    <main>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Jobseeker Dashboard</h1>
          <p>Manage your CV and monitor your visibility.</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="user-info">
            <strong>{jobseeker.full_name}</strong>
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

      {/* Edit Lock Banner */}
      {editLocked && (
        <div className="edit-lock-banner">
          <p>
            <strong>CV Editing Locked</strong>
          </p>
          <p>Your CV is locked while visible to employers. Turn off visibility to edit.</p>
        </div>
      )}

      {/* Profile Visibility Section */}
      <section aria-label="Profile Visibility">
        <h2>Profile Visibility</h2>

        <div className="card">
          <div className="card-header">
            <span className={`cv-state cv-state-${isVisible ? "active" : "draft"}`}>
              {getCVStateLabel(isVisible, editLocked)}
            </span>
            <p className="last-updated">
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          </div>

          <div className="setting-card" style={{ marginTop: "var(--space-md)" }}>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={handleToggleVisibility}
                disabled={togglingVisibility}
              />
              <span>Visible to employers</span>
            </label>
            <p className="form-help" style={{ marginTop: "var(--space-sm)" }}>
              {isVisible
                ? "Your CV is visible to employers in search results. Editing is locked while visible."
                : "Your CV is hidden from employers. You can edit your CV while hidden."}
            </p>
          </div>

          <div style={{ marginTop: "var(--space-lg)", display: "flex", gap: "var(--space-md)" }}>
            <button
              type="button"
              className="pdf-download-btn"
              onClick={handleDownloadPDF}
            >
              Download CV (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* Profile Summary */}
      <section aria-label="CV Summary">
        <h2>Your CV</h2>

        <div className="profile-summary">
          <dl>
            <dt>Name</dt>
            <dd>{jobseeker.full_name || "Not set"}</dd>

            <dt>City</dt>
            <dd>{jobseeker.city || "Not set"}</dd>

            <dt>Role</dt>
            <dd>{jobseeker.preferred_role || "Not set"}</dd>

            <dt>Experience</dt>
            <dd>{jobseeker.years_experience} years</dd>
          </dl>

          {editLocked ? (
            <p className="form-help">
              Turn off visibility to edit your CV.
            </p>
          ) : (
            <Link href="/jobseeker/create-profile">Edit CV</Link>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-label="Quick Actions">
        <h2>Quick Actions</h2>

        <nav className="action-grid">
          <div className="action-card-wrapper">
            <Link href="/jobseeker/interviews" className="action-card">
              <strong>
                {pendingInterviews > 0 && (
                  <span className="notification-bell">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                Interview Requests
              </strong>
              <span>
                {pendingInterviews > 0
                  ? `${pendingInterviews} pending request${pendingInterviews !== 1 ? "s" : ""}`
                  : "View and respond to requests"}
              </span>
            </Link>
            <NotificationBadge count={pendingInterviews} />
          </div>

          <div className="action-card-wrapper">
            <Link href="/messages" className="action-card">
              <strong>
                {unreadMessages > 0 && (
                  <span className="notification-bell">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                Messages
              </strong>
              <span>
                {unreadMessages > 0
                  ? `${unreadMessages} unread message${unreadMessages !== 1 ? "s" : ""}`
                  : "Conversations with employers"}
              </span>
            </Link>
            <NotificationBadge count={unreadMessages} />
          </div>

          <Link href="/jobseeker/settings" className="action-card">
            <strong>Settings</strong>
            <span>Visibility and privacy</span>
          </Link>

          <Link href="/invite" className="action-card">
            <strong>Invite</strong>
            <span>Invite a professional</span>
          </Link>
        </nav>
      </section>

      {/* Privacy Info */}
      <section aria-label="Privacy">
        <h2>Your Privacy</h2>

        <div className="card">
          <p>
            <strong>The following is always hidden from employers:</strong>
          </p>
          <ul>
            <li>
              <strong>Age</strong> - Used for filtering only
            </li>
            <li>
              <strong>Email</strong> - Never shown
            </li>
            <li>
              <strong>Phone</strong> - Shared only after accepting an interview
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
