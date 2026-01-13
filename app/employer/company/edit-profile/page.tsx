"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getMyEmployerProfile, updateEmployerProfile } from "@/lib/supabase/services/employers";
import type { Employer } from "@/lib/supabase/types";

export default function EditCompanyProfilePage() {
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
          router.push("/employer/company/details");
          return;
        }

        if (profile.employer_type !== "company") {
          // Wrong type, redirect to individual edit
          router.push("/employer/individual/edit-profile");
          return;
        }

        setEmployer(profile);
        setPageLoading(false);
      } catch (err) {
        console.error("[EditCompanyProfile] Error loading profile:", err);
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
    const companyName = formData.get("companyName") as string;
    const contactName = formData.get("contactName") as string;
    const industry = formData.get("industry") as string;
    const companySize = formData.get("companySize") as string;
    const website = formData.get("website") as string;
    const registrationNumber = formData.get("registrationNumber") as string;
    const contactRole = formData.get("contactRole") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const companyCity = formData.get("companyCity") as string;

    // Validate required fields
    if (!registrationNumber) {
      setError("CAC Registration Number is required.");
      setLoading(false);
      return;
    }
    if (!companySize) {
      setError("Company Size is required.");
      setLoading(false);
      return;
    }
    if (!website) {
      setError("Company Website is required.");
      setLoading(false);
      return;
    }

    try {
      const result = await updateEmployerProfile(employer.id, {
        display_name: contactName || companyName,
        company_name: companyName,
        industry: industry || null,
        company_size: companySize,
        website: website,
        cac_registration_number: registrationNumber,
        phone: contactPhone || null,
        city: companyCity || null,
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
        <h1>Edit Company Profile</h1>

        <p>
          Update your company information below. Your profile will be submitted
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
            <legend>Company Information</legend>

            <div>
              <label htmlFor="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Enter company name"
                defaultValue={employer.company_name || ""}
                required
              />
            </div>

            <div>
              <label htmlFor="registrationNumber">Registration Number (CAC) *</label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                placeholder="Enter CAC registration number"
                defaultValue={employer.cac_registration_number || ""}
                required
              />
              <p className="form-help">
                Your CAC registration number helps verify your company identity.
              </p>
            </div>

            <div>
              <label htmlFor="industry">Industry</label>
              <input
                type="text"
                id="industry"
                name="industry"
                placeholder="e.g. Technology, Finance, Healthcare"
                defaultValue={employer.industry || ""}
              />
            </div>

            <div>
              <label htmlFor="companySize">Company Size *</label>
              <select
                id="companySize"
                name="companySize"
                defaultValue={employer.company_size || ""}
                required
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501+">501+ employees</option>
              </select>
            </div>

            <div>
              <label htmlFor="website">Company Website *</label>
              <input
                type="url"
                id="website"
                name="website"
                placeholder="https://example.com"
                defaultValue={employer.website || ""}
                required
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Contact Information</legend>

            <div>
              <label htmlFor="contactName">Contact Person Name *</label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                placeholder="Enter full name"
                defaultValue={employer.display_name || ""}
                required
              />
            </div>

            <div>
              <label htmlFor="contactRole">Contact Person Role</label>
              <input
                type="text"
                id="contactRole"
                name="contactRole"
                placeholder="e.g. HR Manager, Recruiter"
                defaultValue=""
              />
            </div>

            <div>
              <label htmlFor="contactPhone">Phone Number</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                placeholder="Enter phone number"
                defaultValue={employer.phone || ""}
              />
            </div>

            <div>
              <label htmlFor="companyCity">City</label>
              <input
                type="text"
                id="companyCity"
                name="companyCity"
                placeholder="Enter city"
                defaultValue={employer.city || ""}
              />
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
