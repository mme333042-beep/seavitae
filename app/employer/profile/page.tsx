"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  EmployerProfile,
  getVerificationStatus,
  getEmployerDisplayName,
  getEmployerTypeLabel,
  getEmployerCategory,
  VerificationStatus,
} from "@/lib/employerVerification";
import EmployerBadge from "@/components/EmployerBadge";

// Mock employer data - in production this would come from a database
const mockEmployer: EmployerProfile = {
  id: "emp-1",
  type: "company",
  name: "John Smith",
  city: "San Francisco",
  companyName: "TechCorp Inc.",
  industry: "Technology",
  companySize: "51-200",
  website: "https://techcorp.example.com",
  registrationNumber: "12345678",
  contactPersonName: "John Smith",
  contactPersonRole: "HR Manager",
  emailVerified: true,
  detailsCompleted: true,
  createdAt: new Date("2024-01-15"),
};

export default function EmployerProfilePage() {
  const [employer, setEmployer] = useState<EmployerProfile>(mockEmployer);
  const [status, setStatus] = useState<VerificationStatus | null>(null);

  useEffect(() => {
    setStatus(getVerificationStatus(employer));
  }, [employer]);

  if (!status) {
    return null;
  }

  return (
    <main>
      <header>
        <h1>Employer Profile</h1>
        <p>Manage your employer information and verification status.</p>
      </header>

      <section aria-label="Profile Preview">
        <h2>How Jobseekers See You</h2>
        <EmployerBadge employer={employer} showDetails />
      </section>

      <section aria-label="Verification Status">
        <h2>Verification Status</h2>

        {status.hasVerifiedDetails ? (
          <article>
            <p>
              <strong>Verified details</strong>
            </p>
            <p>
              Your profile details have been completed. Jobseekers can see this
              status when you contact them.
            </p>
            <p>
              <small>
                This indicates that you have provided complete profile
                information. It is not an official certification or
                endorsement.
              </small>
            </p>
          </article>
        ) : (
          <article>
            <p>
              <strong>Details pending</strong>
            </p>
            <p>
              Complete your profile details to display a "Verified details"
              badge to jobseekers.
            </p>

            {status.missingFields.length > 0 && (
              <div>
                <h3>Missing information</h3>
                <ul>
                  {status.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            )}

            <p>Profile completion: {status.completionPercentage}%</p>

            <div>
              {employer.type === "company" ? (
                <Link href="/employer/company/details">
                  Complete Company Details
                </Link>
              ) : (
                <Link href="/employer/individual/details">
                  Complete Individual Details
                </Link>
              )}
            </div>
          </article>
        )}
      </section>

      <section aria-label="Profile Information">
        <h2>Profile Information</h2>

        <dl>
          <dt>Employer Type</dt>
          <dd>{getEmployerTypeLabel(employer.type)}</dd>

          <dt>Display Name</dt>
          <dd>{getEmployerDisplayName(employer)}</dd>

          <dt>Category</dt>
          <dd>{getEmployerCategory(employer)}</dd>

          <dt>Location</dt>
          <dd>{employer.city}</dd>

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

        <div>
          {employer.type === "company" ? (
            <Link href="/employer/company/details">Edit Profile</Link>
          ) : (
            <Link href="/employer/individual/details">Edit Profile</Link>
          )}
        </div>
      </section>

      <section aria-label="Trust Notice">
        <h2>About Verification</h2>
        <p>
          The "Verified details" status indicates that you have completed your
          employer profile information. This helps jobseekers understand who is
          contacting them.
        </p>
        <p>
          <small>
            This is a trust signal based on profile completion. SeaVitae does
            not perform official identity verification or background checks.
            Employers are responsible for the accuracy of their information.
          </small>
        </p>
      </section>

      <div>
        <Link href="/employer/dashboard">Back to Dashboard</Link>
      </div>
    </main>
  );
}
