"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser, getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { createEmployerProfile, getMyEmployerProfile } from "@/lib/supabase/services/employers";

export default function CompanyDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          // Not logged in - redirect to signup
          router.push("/employer/company/create-account");
          return;
        }

        // Check if email is verified
        if (user.email_confirmed_at === null && user.confirmed_at === null) {
          setEmailNotConfirmed(true);
          setPageLoading(false);
          return;
        }

        setUserId(user.id);

        // Check if user already has an employer profile
        const existingProfile = await getMyEmployerProfile();
        if (existingProfile) {
          // Already has profile, redirect to dashboard
          router.push("/employer/dashboard");
          return;
        }

        setPageLoading(false);
      } catch (err) {
        console.error("[CompanyDetails] Auth check error:", err);
        setError("Failed to verify authentication. Please try again.");
        setPageLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const companyName = formData.get("companyName") as string;
    const contactName = formData.get("contactName") as string;
    const contactRole = formData.get("contactRole") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const companyAddress = formData.get("companyAddress") as string;
    const companyCity = formData.get("companyCity") as string;
    const industry = formData.get("industry") as string;
    const companySize = formData.get("companySize") as string;
    const website = formData.get("website") as string;
    const registrationNumber = formData.get("registrationNumber") as string;

    // Validate required fields
    if (!registrationNumber) {
      setError("CAC Registration Number is required.");
      setLoading(false);
      return;
    }
    if (!industry) {
      setError("Industry is required.");
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
    if (!contactRole) {
      setError("Contact Person Role is required.");
      setLoading(false);
      return;
    }
    if (!contactPhone) {
      setError("Phone Number is required.");
      setLoading(false);
      return;
    }
    if (!companyAddress) {
      setError("Company Address is required.");
      setLoading(false);
      return;
    }
    if (!companyCity) {
      setError("City is required.");
      setLoading(false);
      return;
    }

    try {
      const result = await createEmployerProfile(userId, {
        employer_type: "company",
        display_name: contactName || companyName,
        company_name: companyName,
        industry: industry,
        company_size: companySize,
        website: website,
        cac_registration_number: registrationNumber,
        bio: contactRole,  // Store contact role in bio field
        phone: contactPhone,
        address: companyAddress,
        city: companyCity,
      });

      if (!result.success) {
        setError(result.error || "Failed to create profile");
        setLoading(false);
        return;
      }

      router.push("/employer/dashboard");
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  if (emailNotConfirmed) {
    return (
      <main>
        <section>
          <h1>Confirm Your Email</h1>
          <div className="card">
            <p>
              <strong>Please confirm your email address to continue.</strong>
            </p>
            <p>
              We&apos;ve sent a confirmation email to your inbox. Click the link in the
              email to verify your account and continue setting up your employer profile.
            </p>
            <p style={{ marginTop: "var(--space-lg)" }}>
              <Link href="/login">Already confirmed? Login here</Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Company Details</h1>
        <p>
          Provide details about your company for verification purposes. This
          information helps maintain trust and professionalism on SeaVitae.
        </p>
      </header>

      <section>
        <div className="card" style={{ maxWidth: "var(--max-width-form)" }}>
          {error && (
            <div role="alert" className="alert alert-error" style={{ marginBottom: "var(--space-xl)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Company Information</legend>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="registrationNumber">Registration Number (CAC) *</label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  placeholder="Enter CAC registration number"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="industry">Industry *</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  placeholder="e.g. Technology, Finance, Healthcare"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="companySize">Company Size *</label>
                <select id="companySize" name="companySize" required>
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="website">Company Website *</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>Contact Information</legend>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="contactName">Contact Person Name *</label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="contactRole">Contact Person Role *</label>
                <input
                  type="text"
                  id="contactRole"
                  name="contactRole"
                  placeholder="e.g. HR Manager, Recruiter"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="contactPhone">Phone Number *</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="companyAddress">Company Address *</label>
                <input
                  type="text"
                  id="companyAddress"
                  name="companyAddress"
                  placeholder="Enter company address"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="companyCity">City *</label>
                <input
                  type="text"
                  id="companyCity"
                  name="companyCity"
                  placeholder="Enter city"
                  required
                />
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Continue to Dashboard"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
