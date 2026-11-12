"use client";

import Link from "next/link";
import { isFeedbackEnabled } from "@/lib/softLaunch";

export default function FeedbackWidget() {
  if (!isFeedbackEnabled()) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 40,
      }}
    >
      <Link
        href="/feedback"
        style={{
          display: "inline-block",
          backgroundColor: "var(--sv-navy)",
          color: "var(--sv-white)",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius-full)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          textDecoration: "none",
          boxShadow: "var(--shadow-md)",
        }}
      >
        Feedback
      </Link>
    </div>
  );
}
