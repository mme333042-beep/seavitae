"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  EmployerProfile,
  getVerificationStatus,
  getEmployerDisplayName,
  getEmployerTypeLabel,
  getEmployerCategory,
  VerificationStatus,
} from "@/lib/employerVerification";
import EmployerBadge from "@/components/EmployerBadge";
import { getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getMyEmployerProfile } from "@/lib/supabase/services/employers";
import type { Employer } from "@/lib/supabase/types";

// Convert Supabase Employer to EmployerProfile
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
    registrationNumber: employer.cac_registration_number ?? undefined,
    contactPersonName: employer.display_name,
    contactPersonRole: undefined,
    profession: undefined,
    linkedIn: employer.linkedin_url ?? undefined,
    hiringReason: employer.hiring_purpose ?? undefined,
    emailVerified: true,
    detailsCompleted: employer.is_verified,
    createdAt: new Date(employer.created_at),
  };
}

export default function EmployerProfilePage() {
  const router = useRouter();
  const [employer, setEmployer] = useState<EmployerProfile | null>(null);
  const [rawEmployer, setRawEmployer] = useState<Employer | null>(null);
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const employerData = await getMyEmployerProfile();
        if (!employerData) {
          // Redirect to create profile
          const user = userProfile.user;
          const employerType = user?.user_metadata?.employerType;
          if (employerType === "company") {
            router.push("/employer/company/details");
          } else if (employerType === "individual") {
            router.push("/employer/individual/details");
          } else {
            router.push("/employer");
          }
          return;
        }

        const profile = toEmployerProfile(employerData);
        setEmployer(profile);
        setRawEmployer(employerData);
        setStatus(getVerificationStatus(profile));
        setLoading(false);
      } catch (err) {
        console.error("Error loading employer profile:", err);
        setError("Failed to load profile. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <main>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (error || !employer || !status) {
    return (
      <main>
        <Link href="/employer/dashboard">Back to Dashboard</Link>
        <div className="card">
          <p>{error || "Profile not found."}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Employer Profile</h1>
        <p>Manage your employer information and verification status.</p>
      </header>

      {/* Admin Verification Status Banner */}
      {rawEmployer && rawEmployer.verification_status === "pending" && (
        <div role="status" className="alert alert-warning">
          <h3>Profile Under Review</h3>
          <p>
            Your profile is currently being reviewed by our team. You will be notified once approved.
          </p>
        </div>
      )}

      {rawEmployer && rawEmployer.verification_status === "rejected" && (
        <div role="alert" className="alert alert-error">
          <h3>Profile Verification Failed</h3>
          <p>
            Your profile verification was not approved. Please update your profile with accurate information and resubmit for review.
          </p>
          {rawEmployer.verification_notes && (
            <p>
              <strong>Reason:</strong> {rawEmployer.verification_notes}
            </p>
          )}
        </div>
      )}

      {rawEmployer && rawEmployer.verification_status === "approved" && rawEmployer.is_verified && (
        <div role="status" className="alert alert-success">
          <h3>Profile Verified</h3>
          <p>
            Your employer profile has been verified and approved.
          </p>
        </div>
      )}

      <section aria-label="Profile Preview">
        <h2>How Jobseekers See You</h2>
        <EmployerBadge employer={employer} showDetails />
      </section>

      <section aria-label="Verification Status">
        <h2>Verification Status</h2>

        {status.hasVerifiedDetails ? (
          <article className="card">
            <p>
              <strong>Verified details</strong>
            </p>
            <p>
              Your profile details have been completed. Jobseekers can see this
              status when you contact them.
            </p>
            <p className="form-help">
              This indicates that you have provided complete profile
              information. It is not an official certification or
              endorsement.
            </p>
          </article>
        ) : (
          <article className="card">
            <p>
              <strong>Details pending</strong>
            </p>
            <p>
              Complete your profile details to display a "Verified details"
              badge to jobseekers.
            </p>

            {status.missingFields.length > 0 && (
              <div style={{ marginTop: "var(--space-md)" }}>
                <h3>Missing information</h3>
                <ul>
                  {status.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            )}

            <p style={{ marginTop: "var(--space-md)" }}>
              Profile completion: <strong>{status.completionPercentage}%</strong>
            </p>

            <div style={{ marginTop: "var(--space-md)" }}>
              {employer.type === "company" ? (
                <Link href="/employer/company/edit-profile">
                  Complete Company Details
                </Link>
              ) : (
                <Link href="/employer/individual/edit-profile">
                  Complete Individual Details
                </Link>
              )}
            </div>
          </article>
        )}
      </section>

      <section aria-label="Profile Information">
        <h2>Profile Information</h2>

        <div className="card">
          <dl>
            <dt>Employer Type</dt>
            <dd>{getEmployerTypeLabel(employer.type)}</dd>

            <dt>Display Name</dt>
            <dd>{getEmployerDisplayName(employer)}</dd>

            <dt>Category</dt>
            <dd>{getEmployerCategory(employer)}</dd>

            <dt>Location</dt>
            <dd>{employer.city || "Not specified"}</dd>

            {employer.type === "company" && (
              <>
                <dt>Company Size</dt>
                <dd>{employer.companySize || "Not specified"}</dd>

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
                    "Not specified"
                  )}
                </dd>

                <dt>Contact Person</dt>
                <dd>
                  {employer.contactPersonName || "Not specified"}
                  {employer.contactPersonRole &&
                    ` (${employer.contactPersonRole})`}
                </dd>
              </>
            )}

            {employer.type === "individual" && (
              <>
                <dt>Profession</dt>
                <dd>{employer.profession || "Not specified"}</dd>

                <dt>LinkedIn</dt>
                <dd>
                  {employer.linkedIn ? (
                    <a
                      href={employer.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </a>
                  ) : (
                    "Not specified"
                  )}
                </dd>
              </>
            )}

            <dt>Member Since</dt>
            <dd>{employer.createdAt.toLocaleDateString()}</dd>
          </dl>

          <div style={{ marginTop: "var(--space-lg)" }}>
            {employer.type === "company" ? (
              <Link href="/employer/company/edit-profile">Edit Profile</Link>
            ) : (
              <Link href="/employer/individual/edit-profile">Edit Profile</Link>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Trust Notice">
        <h2>About Verification</h2>
        <div className="card">
          <p>
            The "Verified details" status indicates that you have completed your
            employer profile information. This helps jobseekers understand who is
            contacting them.
          </p>
          <p className="form-help" style={{ marginTop: "var(--space-md)" }}>
            This is a trust signal based on profile completion. SeaVitae does
            not perform official identity verification or background checks.
            Employers are responsible for the accuracy of their information.
          </p>
        </div>
      </section>

      <div style={{ marginTop: "var(--space-xl)" }}>
        <Link href="/employer/dashboard">Back to Dashboard</Link>
      </div>
    </main>
  );
}
