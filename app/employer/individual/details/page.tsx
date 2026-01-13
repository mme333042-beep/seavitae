"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createEmployerProfile, getMyEmployerProfile } from "@/lib/supabase/services/employers";

export default function IndividualDetailsPage() {
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
          router.push("/employer/individual/create-account");
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
        console.error("[IndividualDetails] Auth check error:", err);
        setError("Failed to verify authentication. Please try again.");
        setPageLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setError("You must be logged in to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const fullName = formData.get("fullName") as string;
    const idNumber = formData.get("idNumber") as string;
    const profession = formData.get("profession") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const linkedIn = formData.get("linkedIn") as string;
    const hiringReason = formData.get("hiringReason") as string;

    // Validate required fields
    if (!idNumber) {
      setError("NIN or Passport Number is required.");
      setLoading(false);
      return;
    }
    if (!phone) {
      setError("Phone number is required.");
      setLoading(false);
      return;
    }
    if (!address) {
      setError("Address is required.");
      setLoading(false);
      return;
    }
    if (!city) {
      setError("City is required.");
      setLoading(false);
      return;
    }
    if (!hiringReason) {
      setError("Hiring purpose is required.");
      setLoading(false);
      return;
    }

    // TODO: Handle file uploads for facePhoto and utilityBill to Supabase Storage

    try {
      const result = await createEmployerProfile(userId, {
        employer_type: "individual",
        display_name: fullName,
        company_name: null,
        industry: profession || null,
        linkedin_url: linkedIn || null,
        nin_passport_number: idNumber,
        hiring_purpose: hiringReason as "personal_project" | "freelance_work" | "startup" | "household" | "other",
        phone: phone,
        address: address,
        city: city,
      });

      if (!result.success) {
        setError(result.error || "Failed to create profile");
        setLoading(false);
        return;
      }

      router.push("/employer/dashboard");
    } catch (err) {
      console.error("[IndividualDetails] Error creating profile:", err);
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
        <h1>Individual Details</h1>
        <p>
          Provide your personal details for verification purposes. This
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
              <legend>Personal Information</legend>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="idNumber">NIN or Passport Number *</label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  placeholder="Enter your NIN or passport number"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="profession">Profession</label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  placeholder="e.g. Consultant, Business Owner"
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="facePhoto">Photo of Your Face *</label>
                <input
                  type="file"
                  id="facePhoto"
                  name="facePhoto"
                  accept="image/*"
                  required
                />
                <small style={{ color: "var(--sv-muted)", display: "block", marginTop: "var(--space-xs)" }}>
                  Upload a clear photo of your face for identity verification
                </small>
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="utilityBill">Utility Bill / Address Proof *</label>
                <input
                  type="file"
                  id="utilityBill"
                  name="utilityBill"
                  accept="image/*,.pdf"
                  required
                />
                <small style={{ color: "var(--sv-muted)", display: "block", marginTop: "var(--space-xs)" }}>
                  Upload a utility bill (electricity, water, etc.) or any document showing your address
                </small>
              </div>
            </fieldset>

            <fieldset>
              <legend>Contact Information</legend>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Enter your full address"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="Enter city"
                  required
                />
              </div>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="linkedIn">LinkedIn Profile</label>
                <input
                  type="url"
                  id="linkedIn"
                  name="linkedIn"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>Hiring Purpose</legend>

              <div style={{ marginBottom: "var(--space-lg)" }}>
                <label htmlFor="hiringReason">Why are you hiring? *</label>
                <select id="hiringReason" name="hiringReason" required>
                  <option value="">Select reason</option>
                  <option value="personal_project">Personal project</option>
                  <option value="freelance_work">Freelance work</option>
                  <option value="startup">Starting a business</option>
                  <option value="household">Household staff</option>
                  <option value="other">Other</option>
                </select>
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
