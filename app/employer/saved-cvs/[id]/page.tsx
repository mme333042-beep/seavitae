"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getSavedCVById, deleteSavedCV } from "@/lib/supabase/services/employers";
import type { SavedCV, CVSnapshotData, CVSectionType } from "@/lib/supabase/types";

interface SavedCVDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SavedCVDetailPage({ params }: SavedCVDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [savedCV, setSavedCV] = useState<SavedCV | null>(null);
  const [snapshot, setSnapshot] = useState<CVSnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile || userProfile.role !== "employer") {
          router.push("/employer");
          return;
        }

        const cv = await getSavedCVById(id);
        if (!cv) {
          setError("Saved CV not found.");
          setLoading(false);
          return;
        }

        setSavedCV(cv);
        setSnapshot(cv.snapshot_data as unknown as CVSnapshotData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading saved CV:", err);
        setError("Failed to load saved CV. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  async function handleDelete() {
    if (!savedCV) return;
    if (!confirm("Are you sure you want to remove this saved CV?")) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const result = await deleteSavedCV(savedCV.id);

      if (!result.success) {
        setError(result.error || "Failed to delete saved CV");
        setDeleting(false);
        return;
      }

      router.push("/employer/saved-cvs");
    } catch (err) {
      console.error("Error deleting saved CV:", err);
      setError("Failed to delete saved CV. Please try again.");
      setDeleting(false);
    }
  }

  // Helper to get section content
  function getSectionItems(sectionType: CVSectionType): unknown[] {
    if (!snapshot) return [];
    const section = snapshot.sections.find((s) => s.section_type === sectionType);
    if (!section?.content) return [];
    const content = section.content as { items?: unknown[] };
    return content.items || [];
  }

  function getSummaryText(): string {
    if (!snapshot) return "";
    const section = snapshot.sections.find((s) => s.section_type === "summary");
    if (!section?.content) return "";
    const content = section.content as { text?: string };
    return content.text || "";
  }

  if (loading) {
    return (
      <main>
        <p>Loading saved CV...</p>
      </main>
    );
  }

  if (error && !savedCV) {
    return (
      <main>
        <Link href="/employer/saved-cvs" className="back-link">
          Back to Saved CVs
        </Link>
        <div className="card">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!savedCV || !snapshot) {
    return (
      <main>
        <Link href="/employer/saved-cvs" className="back-link">
          Back to Saved CVs
        </Link>
        <div className="card">
          <p>Saved CV not found.</p>
        </div>
      </main>
    );
  }

  const experiences = getSectionItems("experience") as {
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }[];

  const education = getSectionItems("education") as {
    degree?: string;
    institution?: string;
    location?: string;
    graduationYear?: number;
  }[];

  const skills = getSectionItems("skills") as { name?: string }[];
  const languages = getSectionItems("languages") as { name?: string; proficiency?: string }[];
  const certifications = getSectionItems("certifications") as {
    name?: string;
    issuer?: string;
    issueDate?: string;
  }[];
  const projects = getSectionItems("projects") as {
    name?: string;
    description?: string;
    url?: string;
  }[];

  const summaryText = getSummaryText();

  return (
    <main>
      {/* Back Button */}
      <Link href="/employer/saved-cvs" className="back-link">
        Back to Saved CVs
      </Link>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {/* Snapshot Notice */}
      <div
        role="status"
        style={{
          marginBottom: "var(--space-lg)",
          padding: "var(--space-md)",
          backgroundColor: "var(--color-info-bg, #d1ecf1)",
          border: "1px solid var(--color-info-border, #0dcaf0)",
          borderRadius: "var(--radius-md, 4px)",
        }}
      >
        <strong>Saved CV Snapshot</strong>
        <p style={{ margin: "var(--space-sm) 0 0 0" }}>
          This is a snapshot saved on {formatDate(savedCV.saved_at)}.
          Version {savedCV.snapshot_version} of this CV.
        </p>
      </div>

      {/* CV Header */}
      <header className="cv-profile-header">
        <h1>{snapshot.jobseeker.full_name}</h1>
        <div className="cv-profile-meta">
          <span>{snapshot.jobseeker.city || "Location not specified"}</span>
          <span>{snapshot.jobseeker.preferred_role || "Role not specified"}</span>
        </div>
        <p className="form-help">
          {snapshot.jobseeker.years_experience} years of experience
        </p>
      </header>

      {/* Professional Summary */}
      {(snapshot.jobseeker.bio || summaryText) && (
        <section aria-label="Professional Summary">
          <h2>Professional Summary</h2>
          <div className="card">
            <p>{summaryText || snapshot.jobseeker.bio}</p>
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section aria-label="Skills">
          <h2>Skills</h2>
          <div className="card">
            <div className="cv-preview-card">
              <div className="skills">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill.name || String(skill)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <section aria-label="Experience">
          <h2>Experience</h2>
          <div className="card">
            {experiences.map((exp, index) => (
              <article key={index}>
                <h3>{exp.title}</h3>
                <p>
                  <strong>{exp.company}</strong>
                </p>
                <p className="form-help">
                  {exp.location} | {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </p>
                {exp.description && (
                  <p style={{ marginTop: "var(--space-sm)" }}>{exp.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section aria-label="Education">
          <h2>Education</h2>
          <div className="card">
            {education.map((edu, index) => (
              <article key={index}>
                <h3>{edu.degree}</h3>
                <p>{edu.institution}</p>
                <p className="form-help">
                  {edu.location} | {edu.graduationYear}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section aria-label="Languages">
          <h2>Languages</h2>
          <div className="card">
            <ul>
              {languages.map((lang, index) => (
                <li key={index}>
                  <strong>{lang.name}</strong> - {lang.proficiency}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section aria-label="Certifications">
          <h2>Certifications</h2>
          <div className="card">
            <ul>
              {certifications.map((cert, index) => (
                <li key={index}>
                  <strong>{cert.name}</strong> - {cert.issuer}
                  {cert.issueDate && ` (${cert.issueDate})`}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section aria-label="Projects">
          <h2>Projects</h2>
          <div className="card">
            {projects.map((project, index) => (
              <article key={index}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                {project.url && (
                  <p>
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      View Project
                    </a>
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <section aria-label="Actions">
        <h2>Actions</h2>
        <div className="card">
          <div className="cv-action-buttons">
            <Link href={`/cv/${savedCV.jobseeker_id}/request-interview`} className="btn">
              Request Interview
            </Link>
            <Link href={`/cv/${savedCV.jobseeker_id}/message`} className="btn btn-secondary">
              Message
            </Link>
            <Link href={`/cv/${savedCV.jobseeker_id}`} className="btn btn-secondary">
              View Current Profile
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-secondary"
              style={{ color: "var(--color-error)" }}
            >
              {deleting ? "Removing..." : "Remove Saved CV"}
            </button>
          </div>
        </div>
      </section>

      {/* Notice */}
      <aside className="privacy-notice">
        <p>
          This is a snapshot of the candidate&apos;s CV at the time you saved it.
          To see their latest information, click &quot;View Current Profile&quot;.
        </p>
      </aside>
    </main>
  );
}
