"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  REPORT_REASONS,
  ReportReason,
  validateReport,
} from "@/lib/reporting";
import { getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getJobseekerById } from "@/lib/supabase/services/jobseekers";
import { createReport } from "@/lib/supabase/services/reports";

export default function ReportCVProfilePage() {
  const params = useParams();
  const router = useRouter();
  const cvId = params.id as string;

  const [reason, setReason] = useState<ReportReason | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileName, setProfileName] = useState<string>("this profile");

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          router.push("/login");
          return;
        }

        // Get the jobseeker's name
        const jobseeker = await getJobseekerById(cvId);
        if (jobseeker) {
          setProfileName(jobseeker.full_name);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setLoading(false);
      }
    }
    loadData();
  }, [cvId, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateReport(reason, note);
    if (!validation.valid) {
      setError(validation.error || "Invalid report.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await createReport({
        targetType: "cv_profile",
        targetId: cvId,
        reason: reason as ReportReason,
        note: note || undefined,
      });

      if (!result.success) {
        setError(result.error || "Failed to submit report");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error("Error submitting report:", err);
      setError("Failed to submit report. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  if (submitted) {
    return (
      <main>
        <section>
          <h1>Report Submitted</h1>
          <p>
            Thank you for your report. Our team will review it and take
            appropriate action if necessary.
          </p>
          <p>
            <small>
              Reports are reviewed manually. We do not share reporter
              information with the reported user.
            </small>
          </p>
          <div>
            <Link href={`/cv/${cvId}`}>Back to Profile</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Report Profile</h1>
        <p>Report an issue with {profileName}&apos;s profile</p>
      </header>

      <section>
        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Reason for Report</legend>

            {REPORT_REASONS.map((option) => (
              <div key={option.value}>
                <label>
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => {
                      setReason(option.value);
                      setError("");
                    }}
                  />
                  {option.label}
                </label>
                <p>
                  <small>{option.description}</small>
                </p>
              </div>
            ))}
          </fieldset>

          <div>
            <label htmlFor="note">Additional Details (optional)</label>
            <textarea
              id="note"
              name="note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setError("");
              }}
              rows={4}
              placeholder="Provide any additional context that may help us understand the issue..."
              maxLength={500}
            />
            <p>
              <small>{note.length}/500 characters</small>
            </p>
          </div>

          <div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </section>

      <aside>
        <h2>About Reporting</h2>
        <p>
          Reports help us maintain a professional and trustworthy platform.
          Please only report genuine concerns.
        </p>
        <ul>
          <li>Reports are reviewed by our team</li>
          <li>Your identity is kept confidential</li>
          <li>False reports may affect your account</li>
        </ul>
      </aside>

      <div>
        <Link href={`/cv/${cvId}`}>Cancel</Link>
      </div>
    </main>
  );
}
