"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/supabase/auth";
import {
  getMyJobseekerProfile,
  getMyCV,
  setVisibility,
} from "@/lib/supabase/services/jobseekers";
import { downloadCVAsPDF, isPrintAvailable, CVData } from "@/lib/pdfGenerator";
import AppHeader from "@/components/AppHeader";
import CVDocument from "@/components/CVDocument";
import type { Jobseeker, CVSection } from "@/lib/supabase/types";

function formatLastUpdated(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function buildCVData(jobseeker: Jobseeker, sections: CVSection[], email?: string): CVData {
  // Extract data from CV sections
  const experienceSection = sections.find(s => s.section_type === "experience");
  const educationSection = sections.find(s => s.section_type === "education");
  const skillsSection = sections.find(s => s.section_type === "skills");
  const languagesSection = sections.find(s => s.section_type === "languages");
  const certificationsSection = sections.find(s => s.section_type === "certifications");
  const projectsSection = sections.find(s => s.section_type === "projects");
  const publicationsSection = sections.find(s => s.section_type === "publications");

  const getItems = (section: CVSection | undefined) => {
    if (!section?.content) return [];
    const content = section.content as { items?: unknown[] };
    return content.items || [];
  };

  return {
    fullName: jobseeker.full_name,
    email: email || "",
    phone: jobseeker.phone || "",
    linkedin: jobseeker.linkedin_url || "",
    city: jobseeker.city || "",
    preferredRole: jobseeker.preferred_role || "",
    bio: jobseeker.bio || "",
    skills: getItems(skillsSection).map((s: unknown) => (s as { name: string }).name || String(s)),
    experience: getItems(experienceSection).map((e: unknown) => {
      const exp = e as { title?: string; company?: string; location?: string; startDate?: string; endDate?: string; description?: string };
      return {
        title: exp.title || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "Present",
        description: exp.description || "",
      };
    }),
    education: getItems(educationSection).map((e: unknown) => {
      const edu = e as { degree?: string; institution?: string; location?: string; graduationYear?: number };
      return {
        degree: edu.degree || "",
        institution: edu.institution || "",
        location: edu.location || "",
        year: edu.graduationYear || 0,
      };
    }),
    languages: getItems(languagesSection).map((l: unknown) => {
      const lang = l as { name?: string; proficiency?: string };
      return {
        language: lang.name || "",
        proficiency: lang.proficiency || "",
      };
    }),
    certifications: getItems(certificationsSection).map((c: unknown) => {
      const cert = c as { name?: string; issuer?: string; issueDate?: string };
      return {
        name: cert.name || "",
        issuer: cert.issuer || "",
        year: parseInt(cert.issueDate || "0") || 0,
      };
    }),
    projects: getItems(projectsSection).map((p: unknown) => {
      const proj = p as { name?: string; description?: string; url?: string };
      return {
        name: proj.name || "",
        description: proj.description || "",
        link: proj.url || "",
      };
    }),
    publications: getItems(publicationsSection).map((p: unknown) => {
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

export default function JobseekerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobseeker, setJobseeker] = useState<Jobseeker | null>(null);
  const [sections, setSections] = useState<CVSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          router.push("/jobseeker/signup");
          return;
        }

        if (userProfile.role !== "jobseeker") {
          // Only jobseekers have a CV dashboard in the MVP.
          router.push("/");
          return;
        }

        setUserEmail(userProfile.user?.email || "");

        const profile = await getMyJobseekerProfile();
        if (!profile) {
          router.push("/jobseeker/create-profile");
          return;
        }

        setJobseeker(profile);

        const cvData = await getMyCV();
        if (cvData && cvData.cv) {
          setSections(cvData.sections);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load your CV. Please refresh the page.");
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  /**
   * Legacy state: accounts that turned on employer visibility before the
   * CV-only pivot still have editing locked. Let them unlock it in one click.
   */
  async function handleUnlockEditing() {
    if (!jobseeker) return;

    setUnlocking(true);
    setError(null);

    try {
      const result = await setVisibility(jobseeker.id, false);
      if (!result.success) {
        setError(result.error || "Failed to unlock editing");
        return;
      }
      setJobseeker(prev => (prev ? { ...prev, is_visible: false } : null));
    } catch (err) {
      console.error("Error unlocking CV:", err);
      setError("Failed to unlock editing");
    } finally {
      setUnlocking(false);
    }
  }

  function handleDownloadPDF() {
    if (!jobseeker) return;

    if (isPrintAvailable()) {
      const cvData = buildCVData(jobseeker, sections, userEmail);
      downloadCVAsPDF(cvData);
    } else {
      alert("PDF download is not available in this browser.");
    }
  }

  if (loading) {
    return (
      <>
        <AppHeader showDashboardLink={false} />
        <main>
          <div className="loading-state">
            <p>Loading your CV...</p>
          </div>
        </main>
      </>
    );
  }

  if (!jobseeker) {
    return (
      <>
        <AppHeader showDashboardLink={false} />
        <main>
          <div className="empty-state">
            <p>
              No CV yet. <Link href="/jobseeker/create-profile">Create one now</Link>.
            </p>
          </div>
        </main>
      </>
    );
  }

  const lastUpdated = new Date(jobseeker.updated_at);
  const editLocked = jobseeker.is_visible;
  const cvPreviewData = buildCVData(jobseeker, sections, userEmail);
  const hasCVContent =
    !!jobseeker.bio ||
    cvPreviewData.experience.length > 0 ||
    cvPreviewData.skills.length > 0 ||
    cvPreviewData.education.length > 0;

  return (
    <>
      <AppHeader userName={jobseeker.full_name} showDashboardLink={false} />

      <main>
        {/* Page header with the two primary actions */}
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <h1>Your CV</h1>
            <p>
              Last updated {formatLastUpdated(lastUpdated).toLowerCase()}. Download it as a
              PDF or make changes any time.
            </p>
          </div>
          <div className="dashboard-header-actions">
            {!editLocked && (
              <Link href="/jobseeker/create-profile" className="btn btn-secondary">
                Edit CV
              </Link>
            )}
            <button type="button" onClick={handleDownloadPDF} disabled={!hasCVContent}>
              Download PDF
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        {editLocked && (
          <div className="edit-lock-banner">
            <p>
              <strong>Editing is locked</strong>
            </p>
            <p>
              This CV was marked visible to employers before SeaVitae became a
              CV-only builder. Unlock it to make changes.
            </p>
            <button
              type="button"
              onClick={handleUnlockEditing}
              disabled={unlocking}
              style={{ marginTop: "var(--space-md)" }}
            >
              {unlocking ? "Unlocking..." : "Unlock editing"}
            </button>
          </div>
        )}

        {/* CV Preview - identical to the downloadable PDF */}
        <section aria-label="CV Preview">
          <h2>Preview</h2>
          {hasCVContent ? (
            <>
              <p className="form-help" style={{ marginBottom: "var(--space-lg)" }}>
                This is exactly how your downloaded CV will look.
              </p>
              <CVDocument cv={cvPreviewData} />
            </>
          ) : (
            <div className="empty-state">
              <p>
                Your CV is empty.{" "}
                <Link href="/jobseeker/create-profile">Add your details</Link> to see a
                preview here.
              </p>
            </div>
          )}
        </section>

        {/* At-a-glance details */}
        <section aria-label="CV Details">
          <h2>Details</h2>

          <div className="profile-summary">
            <dl>
              <dt>Name</dt>
              <dd>{jobseeker.full_name || "Not set"}</dd>

              <dt>Role</dt>
              <dd>{jobseeker.preferred_role || "Not set"}</dd>

              <dt>City</dt>
              <dd>{jobseeker.city || "Not set"}</dd>

              <dt>Experience</dt>
              <dd>
                {jobseeker.years_experience}{" "}
                {jobseeker.years_experience === 1 ? "year" : "years"}
              </dd>

              <dt>Skills</dt>
              <dd>{cvPreviewData.skills.length > 0 ? cvPreviewData.skills.join(", ") : "Not set"}</dd>
            </dl>

            {editLocked ? (
              <p className="form-help">Unlock editing above to change these details.</p>
            ) : (
              <Link href="/jobseeker/create-profile">Edit CV</Link>
            )}
          </div>
        </section>

        {/* Privacy Info */}
        <section aria-label="Privacy">
          <div className="privacy-notice">
            <p>
              Your CV is private. It is only shown to you and included in the PDF
              you download. Your email, phone and LinkedIn appear on the CV only if
              you add them.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
