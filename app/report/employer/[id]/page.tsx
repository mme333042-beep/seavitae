"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  REPORT_REASONS,
  ReportReason,
  validateReport,
} from "@/lib/reporting";

export default function ReportEmployerProfilePage() {
  const params = useParams();
  const employerId = params.id as string;

  const [reason, setReason] = useState<ReportReason | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Mock employer name - in production this would come from a database
  const employerName = "TechCorp Inc.";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateReport(reason, note);
    if (!validation.valid) {
      setError(validation.error || "Invalid report.");
      return;
    }

    // Mock submission - in production this would save to database
    setSubmitted(true);
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
              information with the reported employer.
            </small>
          </p>
          <div>
            <Link href="/jobseeker/dashboard">Back to Dashboard</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Report Employer</h1>
        <p>Report an issue with {employerName}</p>
      </header>

      <section>
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

          {error && <p role="alert">{error}</p>}

          <div>
            <button type="submit">Submit Report</button>
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
        <Link href="/jobseeker/interviews">Cancel</Link>
      </div>
    </main>
  );
}
