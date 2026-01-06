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
          backgroundColor: "#1e40af",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          textDecoration: "none",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        Feedback
      </Link>
    </div>
  );
}
