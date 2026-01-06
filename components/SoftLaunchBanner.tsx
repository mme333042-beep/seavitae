"use client";

import Link from "next/link";
import { isSoftLaunch, getLaunchPhaseLabel } from "@/lib/softLaunch";

interface SoftLaunchBannerProps {
  showFeedbackLink?: boolean;
}

export default function SoftLaunchBanner({
  showFeedbackLink = true,
}: SoftLaunchBannerProps) {
  if (!isSoftLaunch()) {
    return null;
  }

  const phaseLabel = getLaunchPhaseLabel();

  return (
    <div
      role="banner"
      style={{
        backgroundColor: "#f0f9ff",
        borderBottom: "1px solid #bae6fd",
        padding: "0.5rem 1rem",
        fontSize: "0.875rem",
        textAlign: "center",
      }}
    >
      <span>
        <strong>{phaseLabel}</strong> &mdash; You are part of a small group
        helping us refine SeaVitae.
      </span>
      {showFeedbackLink && (
        <>
          {" "}
          <Link
            href="/feedback"
            style={{ marginLeft: "0.5rem", textDecoration: "underline" }}
          >
            Share feedback
          </Link>
        </>
      )}
    </div>
  );
}
