"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getMySavedCVs, deleteSavedCV, getMyEmployerProfile } from "@/lib/supabase/services/employers";
import type { SavedCV, Employer, CVSnapshotData } from "@/lib/supabase/types";

interface SavedCVWithData extends SavedCV {
  snapshot: CVSnapshotData;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SavedCVsPage() {
  const router = useRouter();
  const [savedCVs, setSavedCVs] = useState<SavedCVWithData[]>([]);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          router.push("/employer");
          return;
        }

        if (userProfile.role !== "employer") {
          router.push("/jobseeker/dashboard");
          return;
        }

        const employerProfile = await getMyEmployerProfile();
        if (!employerProfile) {
          router.push("/employer");
          return;
        }

        setEmployer(employerProfile);

        // Fetch saved CVs
        const cvs = await getMySavedCVs();
        const cvsWithData: SavedCVWithData[] = cvs.map((cv) => ({
          ...cv,
          snapshot: cv.snapshot_data as unknown as CVSnapshotData,
        }));
        setSavedCVs(cvsWithData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading saved CVs:", err);
        setError("Failed to load saved CVs. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this saved CV?")) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const result = await deleteSavedCV(id);

      if (!result.success) {
        setError(result.error || "Failed to delete saved CV");
        setDeletingId(null);
        return;
      }

      // Remove from local state
      setSavedCVs((prev) => prev.filter((cv) => cv.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting saved CV:", err);
      setError("Failed to delete saved CV. Please try again.");
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading saved CVs...</p>
      </main>
    );
  }

  return (
    <main>
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Saved CVs</h1>
          <p>View and manage CV snapshots you have saved.</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="user-info">
            <strong>{employer?.display_name || "Employer"}</strong>
            <br />
            <span>{employer?.employer_type === "company" ? employer.company_name || "Company" : "Individual"}</span>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {/* Saved CVs List */}
      <section aria-label="Saved CVs">
        {savedCVs.length === 0 ? (
          <div className="card empty-state">
            <p>
              <strong>No saved CVs yet.</strong>
            </p>
            <p>
              When you find candidates you&apos;re interested in, save their CVs to keep a snapshot
              for your records. Saved CVs preserve the exact version you reviewed.
            </p>
            <p style={{ marginTop: "var(--space-lg)" }}>
              <Link href="/employer/dashboard">Search for candidates</Link>
            </p>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: "var(--space-lg)" }}>
              <strong>{savedCVs.length} saved CV{savedCVs.length !== 1 ? "s" : ""}</strong>
            </p>

            <div className="results-list">
              {savedCVs.map((savedCV) => (
                <article key={savedCV.id} className="card">
                  <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{savedCV.snapshot.jobseeker.full_name}</h3>
                      <p className="form-help" style={{ margin: "var(--space-xs) 0 0 0" }}>
                        {savedCV.snapshot.jobseeker.preferred_role || "No role specified"}
                        {savedCV.snapshot.jobseeker.city && ` - ${savedCV.snapshot.jobseeker.city}`}
                      </p>
                    </div>
                    <span className="cv-state cv-state-active">
                      Version {savedCV.snapshot_version}
                    </span>
                  </div>

                  {savedCV.snapshot.jobseeker.bio && (
                    <p style={{ marginTop: "var(--space-md)", color: "var(--color-text-muted)" }}>
                      {savedCV.snapshot.jobseeker.bio.length > 200
                        ? `${savedCV.snapshot.jobseeker.bio.substring(0, 200)}...`
                        : savedCV.snapshot.jobseeker.bio}
                    </p>
                  )}

                  <div style={{ marginTop: "var(--space-md)" }}>
                    <p className="form-help">
                      <strong>Experience:</strong> {savedCV.snapshot.jobseeker.years_experience} years
                    </p>
                    <p className="form-help">
                      <strong>Saved on:</strong> {formatDate(savedCV.saved_at)}
                    </p>
                  </div>

                  {savedCV.notes && (
                    <div
                      style={{
                        marginTop: "var(--space-md)",
                        padding: "var(--space-md)",
                        backgroundColor: "var(--sv-mist)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        <strong>Your notes:</strong>
                      </p>
                      <p style={{ margin: "var(--space-sm) 0 0 0" }}>{savedCV.notes}</p>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "var(--space-lg)",
                      paddingTop: "var(--space-lg)",
                      borderTop: "1px solid var(--sv-border-light)",
                      display: "flex",
                      gap: "var(--space-md)",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link href={`/employer/saved-cvs/${savedCV.id}`} className="btn">
                      View Full CV
                    </Link>
                    <Link href={`/cv/${savedCV.jobseeker_id}`} className="btn btn-secondary">
                      View Current Profile
                    </Link>
                    <Link href={`/cv/${savedCV.jobseeker_id}/request-interview`} className="btn btn-secondary">
                      Request Interview
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(savedCV.id)}
                      disabled={deletingId === savedCV.id}
                      className="btn-secondary"
                      style={{ color: "var(--color-error)" }}
                    >
                      {deletingId === savedCV.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Info Notice */}
      <aside className="privacy-notice">
        <p>
          <strong>About Saved CVs:</strong> When you save a CV, you preserve that exact version.
          Even if the candidate updates their CV later, your saved version remains unchanged.
          This helps maintain consistency during your hiring process.
        </p>
      </aside>

      {/* Navigation */}
      <nav style={{ marginTop: "var(--space-xl)" }}>
        <Link href="/employer/dashboard">Back to Dashboard</Link>
      </nav>
    </main>
  );
}
