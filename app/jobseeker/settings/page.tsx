"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  checkProfileCompletion,
  getVisibilityMessage,
  ProfileCompletionStatus,
  JobseekerProfile,
} from "@/lib/profileVisibility";
import { trackEvent } from "@/lib/analytics";
import { trackProfileMadeVisible } from "@/lib/posthog";
import { signOut, getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getMyJobseekerProfile } from "@/lib/supabase/services/jobseekers";

const initialProfile: JobseekerProfile = {
  fullName: "",
  city: "",
  preferredRole: "",
  bio: "",
  hasExperience: false,
  hasSkills: false,
  isOpenToDiscovery: false,
};

export default function JobseekerSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<JobseekerProfile>(initialProfile);
  const [status, setStatus] = useState<ProfileCompletionStatus | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Jobseeker");

  useEffect(() => {
    async function checkAuth() {
      const userProfile = await getCurrentUserWithProfile();
      if (!userProfile) {
        router.push("/jobseeker/signup");
        return;
      }
      if (userProfile.role !== "jobseeker") {
        router.push("/employer/dashboard");
        return;
      }

      // Load actual profile data
      const jobseekerProfile = await getMyJobseekerProfile();
      if (jobseekerProfile) {
        setUserName(jobseekerProfile.full_name || "Jobseeker");
        setProfile({
          fullName: jobseekerProfile.full_name,
          city: jobseekerProfile.city || "",
          preferredRole: jobseekerProfile.preferred_role || "",
          bio: jobseekerProfile.bio || "",
          hasExperience: true, // Assume true if profile exists
          hasSkills: true,
          isOpenToDiscovery: jobseekerProfile.is_visible,
        });
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    setStatus(checkProfileCompletion(profile));
  }, [profile]);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  function handleToggleDiscovery() {
    setProfile((prev) => ({
      ...prev,
      isOpenToDiscovery: !prev.isOpenToDiscovery,
    }));
    setSaved(false);
  }

  function handleSave() {
    trackEvent("cv_visibility_changed", {
      userRole: "jobseeker",
      metadata: { isOpenToDiscovery: profile.isOpenToDiscovery ?? false },
    });

    // Track profile made visible (PostHog funnel tracking)
    if (profile.isOpenToDiscovery) {
      trackProfileMadeVisible();
    }

    setSaved(true);
  }

  if (loading || !status) {
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
          <h1>Settings</h1>
          <p>Manage your visibility and privacy preferences.</p>
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

      {/* Current Status */}
      <section aria-label="Visibility Status">
        <h2>Current Status</h2>

        {status.isDiscoverable ? (
          <div className="status-box status-visible">
            <p>
              <strong>Your CV is visible to employers.</strong>
            </p>
            <p>Employers can find you in search results.</p>
          </div>
        ) : (
          <div className="status-box status-hidden">
            <p>
              <strong>Your CV is hidden from employers.</strong>
            </p>
            <p>{getVisibilityMessage(status)}</p>

            {!status.isComplete && (
              <div className="action-needed">
                <h3>To become discoverable:</h3>
                <ul>
                  {status.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
                <Link href="/jobseeker/create-profile">Complete Your CV</Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Discovery Toggle */}
      <section aria-label="Discovery Settings">
        <h2>Discovery Settings</h2>

        <div className="setting-card">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={profile.isOpenToDiscovery}
              onChange={handleToggleDiscovery}
            />
            <span>Open to Discovery</span>
          </label>
          <p className="form-help">
            When enabled, your CV appears in employer search results.
          </p>
        </div>

        {saved && <p className="save-success">Settings saved.</p>}

        <button type="submit" onClick={handleSave}>
          Save Settings
        </button>
      </section>

      {/* What Employers See */}
      <section aria-label="Privacy Information">
        <h2>What Employers See</h2>

        <div className="two-column">
          <div className="card">
            <h3>Visible</h3>
            <ul>
              <li>Full name</li>
              <li>City</li>
              <li>Preferred role</li>
              <li>Professional summary</li>
              <li>Experience</li>
              <li>Skills</li>
              <li>Education</li>
              <li>Certifications</li>
              <li>Projects</li>
              <li>Publications</li>
            </ul>
          </div>

          <div className="card">
            <h3>Hidden</h3>
            <ul>
              <li>
                <strong>Age</strong> - Used for filtering only
              </li>
              <li>
                <strong>Email</strong> - Never shown
              </li>
              <li>
                <strong>Phone</strong> - Shared only after accepting an
                interview
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section aria-label="Requirements">
        <h2>Discoverability Requirements</h2>

        <div className="card">
          <p>
            <strong>For your CV to appear in search results:</strong>
          </p>

          <ul className="checklist">
            <li className={status.isOpenToDiscovery ? "done" : ""}>
              Open to Discovery enabled
            </li>
            <li className={status.hasDesiredRole ? "done" : ""}>
              Preferred job role set
            </li>
            <li className={status.hasCity ? "done" : ""}>City set</li>
            <li className={status.isComplete ? "done" : ""}>CV complete</li>
          </ul>
        </div>
      </section>

      {/* Navigation */}
      <nav style={{ marginTop: "var(--space-xl)" }}>
        <Link href="/jobseeker/dashboard">Back to Dashboard</Link>
      </nav>
    </main>
  );
}
