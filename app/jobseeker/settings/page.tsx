"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  checkProfileCompletion,
  getVisibilityMessage,
  ProfileCompletionStatus,
  JobseekerProfile,
} from "@/lib/profileVisibility";
import { trackEvent } from "@/lib/analytics";

const initialProfile: JobseekerProfile = {
  fullName: "John Doe",
  city: "San Francisco",
  preferredRole: "Senior Machine Learning Engineer",
  bio: "Senior Machine Learning Engineer with 8 years of experience.",
  hasExperience: true,
  hasSkills: true,
  isOpenToDiscovery: true,
};

export default function JobseekerSettingsPage() {
  const [profile, setProfile] = useState<JobseekerProfile>(initialProfile);
  const [status, setStatus] = useState<ProfileCompletionStatus | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStatus(checkProfileCompletion(profile));
  }, [profile]);

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

    setSaved(true);
  }

  if (!status) {
    return null;
  }

  return (
    <main>
      {/* Header */}
      <header>
        <h1>Profile Settings</h1>
        <p>Manage your visibility and privacy preferences.</p>
      </header>

      {/* Current Status */}
      <section aria-label="Visibility Status">
        <h2>Current Status</h2>

        {status.isDiscoverable ? (
          <div className="status-box status-visible">
            <p><strong>Your profile is visible to employers.</strong></p>
            <p>Employers can find you in search results.</p>
          </div>
        ) : (
          <div className="status-box status-hidden">
            <p><strong>Your profile is hidden from employers.</strong></p>
            <p>{getVisibilityMessage(status)}</p>

            {!status.isComplete && (
              <div className="action-needed">
                <h3>To become discoverable:</h3>
                <ul>
                  {status.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
                <Link href="/jobseeker/create-profile">Complete Your Profile</Link>
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
          <p>When enabled, your profile appears in employer search results.</p>
        </div>

        {saved && <p className="save-success">Settings saved.</p>}

        <button type="button" onClick={handleSave}>
          Save Settings
        </button>
      </section>

      {/* What Employers See */}
      <section aria-label="Privacy Information">
        <h2>What Employers See</h2>

        <div className="two-column">
          <div>
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

          <div>
            <h3>Hidden</h3>
            <ul>
              <li><strong>Age</strong> &mdash; Used for filtering only</li>
              <li><strong>Email</strong> &mdash; Never shown</li>
              <li><strong>Phone</strong> &mdash; Shared only after accepting an interview</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section aria-label="Requirements">
        <h2>Discoverability Requirements</h2>

        <p>For your profile to appear in search results:</p>

        <ul className="checklist">
          <li className={status.isOpenToDiscovery ? "done" : ""}>
            Open to Discovery enabled
          </li>
          <li className={status.hasDesiredRole ? "done" : ""}>
            Preferred job role set
          </li>
          <li className={status.hasCity ? "done" : ""}>
            City set
          </li>
          <li className={status.isComplete ? "done" : ""}>
            Profile complete
          </li>
        </ul>
      </section>

      {/* Navigation */}
      <nav>
        <Link href="/jobseeker/dashboard">Back to Dashboard</Link>
      </nav>
    </main>
  );
}
