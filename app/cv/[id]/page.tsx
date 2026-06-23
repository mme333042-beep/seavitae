"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import ReportButton from "@/components/ReportButton";
import CVDocument from "@/components/CVDocument";
import { formatLastUpdated } from "@/lib/cvState";
import { getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getJobseekerCV } from "@/lib/supabase/services/jobseekers";
import { saveCV, isCVSaved, getMyEmployerProfile } from "@/lib/supabase/services/employers";
import type { Jobseeker, CVSection } from "@/lib/supabase/types";
import { trackCVViewed, trackCVSavedByEmployer } from "@/lib/posthog";

interface CVProfilePageProps {
  params: Promise<{ id: string }>;
}

interface CVData {
  fullName: string;
  city: string;
  preferredRole: string;
  bio: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    year: number;
  }[];
  languages: { language: string; proficiency: string }[];
  certifications: { name: string; issuer: string; year: number }[];
  projects: { name: string; description: string; link: string }[];
  publications: { title: string; venue: string; link: string }[];
  lastUpdated: Date;
}

// Transform database data to CVData format
function transformToCVData(
  jobseeker: Jobseeker,
  sections: CVSection[]
): CVData {
  // Helper to get items from a section
  const getItems = (sectionType: string) => {
    const section = sections.find((s) => s.section_type === sectionType);
    if (!section?.content) return [];
    const content = section.content as { items?: unknown[] };
    return content.items || [];
  };

  return {
    fullName: jobseeker.full_name,
    city: jobseeker.city || "",
    preferredRole: jobseeker.preferred_role || "",
    bio: jobseeker.bio || "",
    skills: getItems("skills").map((s: unknown) => {
      const skill = s as { name?: string };
      return skill.name || String(s);
    }),
    experience: getItems("experience").map((e: unknown) => {
      const exp = e as {
        title?: string;
        company?: string;
        location?: string;
        startDate?: string;
        endDate?: string;
        current?: boolean;
        description?: string;
      };
      return {
        title: exp.title || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.current ? "Present" : exp.endDate || "",
        description: exp.description || "",
      };
    }),
    education: getItems("education").map((e: unknown) => {
      const edu = e as {
        degree?: string;
        institution?: string;
        location?: string;
        graduationYear?: number;
      };
      return {
        degree: edu.degree || "",
        institution: edu.institution || "",
        location: edu.location || "",
        year: edu.graduationYear || 0,
      };
    }),
    languages: getItems("languages").map((l: unknown) => {
      const lang = l as { name?: string; proficiency?: string };
      return {
        language: lang.name || "",
        proficiency: lang.proficiency || "",
      };
    }),
    certifications: getItems("certifications").map((c: unknown) => {
      const cert = c as { name?: string; issuer?: string; issueDate?: string };
      return {
        name: cert.name || "",
        issuer: cert.issuer || "",
        year: parseInt(cert.issueDate || "0") || 0,
      };
    }),
    projects: getItems("projects").map((p: unknown) => {
      const proj = p as { name?: string; description?: string; url?: string };
      return {
        name: proj.name || "",
        description: proj.description || "",
        link: proj.url || "",
      };
    }),
    publications: getItems("publications").map((p: unknown) => {
      const pub = p as { title?: string; publisher?: string; url?: string };
      return {
        title: pub.title || "",
        venue: pub.publisher || "",
        link: pub.url || "",
      };
    }),
    lastUpdated: new Date(jobseeker.updated_at),
  };
}

export default function CVProfilePage({ params }: CVProfilePageProps) {
  const { id } = use(params);
  const [cv, setCV] = useState<CVData | null>(null);
  const [jobseekerId, setJobseekerId] = useState<string>("");
  const [cvId, setCvId] = useState<string>("");
  const [cvSaved, setCvSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Check auth and role
        const userProfile = await getCurrentUserWithProfile();
        if (userProfile) {
          setIsEmployer(userProfile.role === "employer");

          // Check employer verification status
          if (userProfile.role === "employer") {
            const employerProfile = await getMyEmployerProfile();
            setIsVerified(employerProfile?.is_verified || false);
          }
        }

        // Fetch CV data from Supabase
        const cvData = await getJobseekerCV(id);

        if (!cvData) {
          setError("CV not found or is not publicly visible.");
          setLoading(false);
          return;
        }

        setJobseekerId(cvData.jobseeker.id);
        setCvId(cvData.cv.id);

        // Transform to display format
        const transformedCV = transformToCVData(cvData.jobseeker, cvData.sections);
        setCV(transformedCV);

        // Check if employer has already saved this CV
        if (userProfile?.role === "employer") {
          const savedStatus = await isCVSaved(cvData.cv.id);
          setCvSaved(savedStatus.saved);

          // Track CV viewed by employer (PostHog funnel tracking)
          trackCVViewed();
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading CV:", err);
        setError("Failed to load CV. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function handleSaveCV() {
    if (!isEmployer || !jobseekerId || !cvId) return;

    setSaving(true);
    setError(null);

    try {
      const result = await saveCV(jobseekerId, cvId);

      if (!result.success) {
        setError(result.error || "Failed to save CV");
        setSaving(false);
        return;
      }

      // Track CV saved by employer (PostHog funnel tracking)
      trackCVSavedByEmployer();

      setSaving(false);
      setCvSaved(true);
    } catch (err) {
      console.error("Error saving CV:", err);
      setError("Failed to save CV. Please try again.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading CV...</p>
      </main>
    );
  }

  if (error && !cv) {
    return (
      <main>
        <Link href={isEmployer ? "/employer/dashboard" : "/jobseeker/dashboard"} className="back-link">
          Back to Dashboard
        </Link>
        <div className="card">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!cv) {
    return (
      <main>
        <Link href={isEmployer ? "/employer/dashboard" : "/jobseeker/dashboard"} className="back-link">
          Back to Dashboard
        </Link>
        <div className="card">
          <p>CV not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Back Button */}
      <Link href={isEmployer ? "/employer/dashboard" : "/jobseeker/dashboard"} className="back-link">
        Back to Dashboard
      </Link>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {/* CV Document (same layout as the downloadable PDF) */}
      <p className="last-updated" style={{ marginBottom: "var(--space-md)" }}>
        Last updated: {formatLastUpdated(cv.lastUpdated)}
      </p>
      <CVDocument cv={cv} />

      {/* Employer Actions - At Bottom */}
      {isEmployer && (
        <section aria-label="Actions">
          <h2>Actions</h2>

          {/* Verification Warning for unverified employers */}
          {!isVerified && (
            <div role="status" className="alert alert-warning">
              <h3>Account Verification Required</h3>
              <p>
                Your employer account must be verified before you can request interviews or save CVs.
                <br />
                <Link href="/employer/profile">Check verification status</Link>
              </p>
            </div>
          )}

          <div className="card">
            <div className="cv-action-buttons" style={!isVerified ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
              <Link href={`/cv/${id}/request-interview`} className="btn">
                Request Interview
              </Link>
              <Link href={`/cv/${id}/message`} className="btn btn-secondary">
                Message
              </Link>
              <button
                type="button"
                onClick={handleSaveCV}
                disabled={saving || cvSaved || !isVerified}
                className="btn-secondary"
              >
                {saving ? "Saving..." : cvSaved ? "CV Saved" : "Save CV"}
              </button>
            </div>

            {cvSaved && (
              <p className="form-help" style={{ marginTop: "var(--space-md)" }}>
                This CV has been saved to your account. You will retain this version
                even if the candidate updates their CV.
                <br />
                <Link href="/employer/saved-cvs">View your saved CVs</Link>
              </p>
            )}

            <div style={{ marginTop: "var(--space-lg)" }}>
              <p className="form-help">
                Phone contact is available only after the candidate accepts an interview request.
              </p>
            </div>

            <div style={{ marginTop: "var(--space-md)" }}>
              <ReportButton
                targetType="cv_profile"
                targetId={id}
                targetName={cv.fullName}
              />
            </div>
          </div>
        </section>
      )}

      {/* Privacy Notice */}
      <aside className="privacy-notice">
        <p>
          This candidate&apos;s email address and phone number are private.
          Phone contact becomes available only after the candidate accepts an
          interview request.
        </p>
      </aside>
    </main>
  );
}
