"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  checkProfileCompletion,
  getVisibilityMessage,
  ProfileCompletionStatus,
  JobseekerProfile,
} from "@/lib/profileVisibility";

const mockProfile: JobseekerProfile = {
  fullName: "John Doe",
  city: "San Francisco",
  preferredRole: "Senior Machine Learning Engineer",
  bio: "Senior Machine Learning Engineer with 8 years of experience.",
  hasExperience: true,
  hasSkills: true,
  isOpenToDiscovery: true,
};

export default function JobseekerDashboardPage() {
  const [profile, setProfile] = useState<JobseekerProfile>(mockProfile);
  const [status, setStatus] = useState<ProfileCompletionStatus | null>(null);

  useEffect(() => {
    setStatus(checkProfileCompletion(profile));
  }, [profile]);

  if (!status) {
    return null;
  }

  return (
    <main>
      {/* Header */}
      <header>
        <h1>Jobseeker Dashboard</h1>
        <p>Manage your profile and monitor your visibility.</p>
      </header>

      {/* Visibility Status */}
      <section aria-label="Visibility Status">
        <h2>Visibility Status</h2>

        {status.isDiscoverable ? (
          <div className="status-box status-visible">
            <p><strong>Discoverable</strong></p>
            <p>Employers can find your profile in search results.</p>
          </div>
        ) : (
          <div className="status-box status-hidden">
            <p><strong>Not Discoverable</strong></p>
            <p>{getVisibilityMessage(status)}</p>

            {!status.isComplete && (
              <div className="action-needed">
                <p>Missing:</p>
                <ul>
                  {status.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
                <Link href="/jobseeker/create-profile">Complete Profile</Link>
              </div>
            )}

            {!status.isOpenToDiscovery && status.isComplete && (
              <div className="action-needed">
                <p>Profile complete but discovery is off.</p>
                <Link href="/jobseeker/settings">Enable Discovery</Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Profile Summary */}
      <section aria-label="Profile Summary">
        <h2>Your Profile</h2>

        <div className="profile-summary">
          <dl>
            <dt>Name</dt>
            <dd>{profile.fullName || "Not set"}</dd>

            <dt>City</dt>
            <dd>{profile.city || "Not set"}</dd>

            <dt>Role</dt>
            <dd>{profile.preferredRole || "Not set"}</dd>
          </dl>

          <Link href="/jobseeker/create-profile">Edit Profile</Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-label="Quick Actions">
        <h2>Quick Actions</h2>

        <nav className="action-grid">
          <Link href="/jobseeker/interviews" className="action-card">
            <strong>Interview Requests</strong>
            <span>View and respond to requests</span>
          </Link>

          <Link href="/messages" className="action-card">
            <strong>Messages</strong>
            <span>Conversations with employers</span>
          </Link>

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

        <p>The following is always hidden from employers:</p>
        <ul>
          <li><strong>Age</strong> &mdash; Used for filtering only</li>
          <li><strong>Email</strong> &mdash; Never shown</li>
          <li><strong>Phone</strong> &mdash; Shared only after accepting an interview</li>
        </ul>
      </section>
    </main>
  );
}
