"use client";

import { useState } from "react";
import ReportModal from "./ReportModal";
import { ReportTargetType } from "@/lib/reporting";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
  variant?: "link" | "button";
}

export default function ReportButton({
  targetType,
  targetId,
  targetName,
  variant = "link",
}: ReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const label = targetType === "cv_profile" ? "Report Profile" : "Report Employer";

  if (variant === "link") {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "#666",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "inherit",
          }}
        >
          {label}
        </button>
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetType={targetType}
          targetId={targetId}
          targetName={targetName}
        />
      </>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setIsModalOpen(true)}>
        {label}
      </button>
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetName={targetName}
      />
    </>
  );
}
