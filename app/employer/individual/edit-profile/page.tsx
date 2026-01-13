"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getMyEmployerProfile, updateEmployerProfile } from "@/lib/supabase/services/employers";
import type { Employer } from "@/lib/supabase/types";

export default function EditIndividualProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const profile = await getMyEmployerProfile();
        if (!profile) {
          // No profile exists, redirect to create
          router.push("/employer/individual/details");
          return;
        }

        if (profile.employer_type !== "individual") {
          // Wrong type, redirect to company edit
          router.push("/employer/company/edit-profile");
          return;
        }

        setEmployer(profile);
        setPageLoading(false);
      } catch (err) {
        console.error("[EditIndividualProfile] Error loading profile:", err);
        setError("Failed to load profile. Please try again.");
        setPageLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employer) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const fullName = formData.get("fullName") as string;
    const idNumber = formData.get("idNumber") as string;
    const profession = formData.get("profession") as string;
    const phone = formData.get("phone") as string;
    const city = formData.get("city") as string;
    const linkedIn = formData.get("linkedIn") as string;
    const hiringReason = formData.get("hiringReason") as string;

    try {
      const result = await updateEmployerProfile(employer.id, {
        display_name: fullName,
        industry: profession || null,
        nin_passport_number: idNumber || null,
        phone: phone || null,
        city: city || null,
        linkedin_url: linkedIn || null,
        hiring_purpose: hiringReason || null,
        // Reset verification status - profile goes back to pending review
        verification_status: "pending",
        is_verified: false,
        verification_date: null,
        verification_notes: null,
      });

      if (!result.success) {
        setError(result.error || "Failed to update profile");
        setLoading(false);
        return;
      }

      // Redirect to dashboard - profile is now pending review
      router.push("/employer/dashboard?updated=true");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <main>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!employer) {
    return (
      <main>
        <section>
          <h1>Profile Not Found</h1>
          <p>Unable to load your employer profile.</p>
          <Link href="/employer/dashboard">Back to Dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Edit Individual Profile</h1>

        <p>
          Update your personal information below. Your profile will be submitted
          for review after any changes are made.
        </p>

        {employer.verification_status === "pending" && (
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
            <strong>Profile Under Review</strong>
            <p style={{ margin: "var(--space-sm) 0 0 0" }}>
              Your profile is currently being reviewed. You can still make changes,
              but they will reset the review process.
            </p>
          </div>
        )}

        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Personal Information</legend>

            <div>
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                defaultValue={employer.display_name || ""}
                required
              />
            </div>

            <div>
              <label htmlFor="idNumber">NIN / Passport Number</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                placeholder="Enter national ID or passport number"
                defaultValue={employer.nin_passport_number || ""}
              />
              <p className="form-help">
                Your identification number helps verify your identity.
              </p>
            </div>

            <div>
              <label htmlFor="profession">Profession</label>
              <input
                type="text"
                id="profession"
                name="profession"
                placeholder="e.g. Consultant, Business Owner"
                defaultValue={employer.industry || ""}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Contact Information</legend>

            <div>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                defaultValue={employer.phone || ""}
              />
            </div>

            <div>
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter city"
                defaultValue={employer.city || ""}
              />
            </div>

            <div>
              <label htmlFor="linkedIn">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedIn"
                name="linkedIn"
                placeholder="https://linkedin.com/in/yourprofile"
                defaultValue={employer.linkedin_url || ""}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Hiring Purpose</legend>

            <div>
              <label htmlFor="hiringReason">Why are you hiring?</label>
              <select
                id="hiringReason"
                name="hiringReason"
                defaultValue={employer.hiring_purpose || ""}
              >
                <option value="">Select reason</option>
                <option value="personal-project">Personal project</option>
                <option value="freelance-work">Freelance work</option>
                <option value="startup">Starting a business</option>
                <option value="household">Household staff</option>
                <option value="other">Other</option>
              </select>
            </div>
          </fieldset>

          <div
            style={{
              marginTop: "var(--space-lg)",
              padding: "var(--space-md)",
              backgroundColor: "var(--color-info-bg, #e7f3ff)",
              border: "1px solid var(--color-info-border, #0066cc)",
              borderRadius: "var(--radius-md, 4px)",
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Note:</strong> After submitting changes, your profile will be
              placed under review. You will be notified once your profile has been
              approved.
            </p>
          </div>

          <div style={{ marginTop: "var(--space-lg)", display: "flex", gap: "var(--space-md)" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes & Submit for Review"}
            </button>
            <Link
              href="/employer/profile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "var(--space-sm) var(--space-md)",
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
