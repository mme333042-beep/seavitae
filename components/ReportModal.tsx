"use client";

import { useState } from "react";
import {
  REPORT_REASONS,
  ReportReason,
  ReportTargetType,
  validateReport,
} from "@/lib/reporting";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  function handleClose() {
    setReason("");
    setNote("");
    setError("");
    setSubmitted(false);
    onClose();
  }

  if (!isOpen) return null;

  const targetLabel = targetType === "cv_profile" ? "profile" : "employer";

  if (submitted) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          zIndex: 50,
        }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            maxWidth: "28rem",
            width: "100%",
          }}
        >
          <h2 id="report-modal-title">Report Submitted</h2>
          <p>
            Thank you for your report. Our team will review it and take
            appropriate action if necessary.
          </p>
          <p>
            <small>
              Reports are reviewed manually. Your identity is kept confidential.
            </small>
          </p>
          <div style={{ marginTop: "1rem" }}>
            <button type="button" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 50,
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          maxWidth: "28rem",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 id="report-modal-title">Report {targetLabel}</h2>
        <p>
          <small>Report an issue with {targetName}</small>
        </p>

        <form onSubmit={handleSubmit}>
          <fieldset style={{ border: "none", padding: 0, margin: "1rem 0" }}>
            <legend style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
              What's the issue?
            </legend>

            {REPORT_REASONS.map((option) => (
              <div key={option.value} style={{ marginBottom: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => {
                      setReason(option.value);
                      setError("");
                    }}
                    style={{ marginTop: "0.25rem" }}
                  />
                  <span>
                    {option.label}
                    <br />
                    <small style={{ color: "#666" }}>{option.description}</small>
                  </span>
                </label>
              </div>
            ))}
          </fieldset>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="report-note" style={{ display: "block", marginBottom: "0.25rem" }}>
              Additional details (optional)
            </label>
            <textarea
              id="report-note"
              name="note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setError("");
              }}
              rows={3}
              placeholder="Any additional context..."
              maxLength={500}
              style={{ width: "100%", padding: "0.5rem" }}
            />
            <p>
              <small>{note.length}/500</small>
            </p>
          </div>

          {error && (
            <p role="alert" style={{ color: "#dc2626", marginBottom: "1rem" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
