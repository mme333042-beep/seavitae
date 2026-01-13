"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CVPreviewCard, { CVPreview } from "@/components/CVPreviewCard";
import { trackEvent } from "@/lib/analytics";
import { trackSearchPerformed, identifyUser } from "@/lib/posthog";
import { signOut, getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { getMyEmployerProfile } from "@/lib/supabase/services/employers";
import { searchJobseekers, JobseekerSearchFilters } from "@/lib/supabase/services/jobseekers";
import type { Jobseeker, Employer } from "@/lib/supabase/types";

interface CVPreviewWithDate extends CVPreview {
  lastUpdated: Date;
}

function formatLastUpdated(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function jobseekerToPreview(js: Jobseeker): CVPreviewWithDate {
  return {
    id: js.id,
    fullName: js.full_name,
    city: js.city || "",
    preferredRole: js.preferred_role || "",
    skills: [], // Skills are in CV sections, would need to fetch separately
    bio: js.bio || "",
    lastUpdated: new Date(js.updated_at),
  };
}

// Component to handle search params (must be wrapped in Suspense)
function UpdateSuccessMessage() {
  const searchParams = useSearchParams();
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("updated") === "true") {
      setShowUpdateSuccess(true);
      // Clear the query param from URL without refresh
      window.history.replaceState({}, "", "/employer/dashboard");
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowUpdateSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showUpdateSuccess) return null;

  return (
    <div role="status" className="alert alert-success">
      <h3>Profile Updated Successfully!</h3>
      <p>
        Your profile changes have been submitted for review. You will be notified once approved.
      </p>
    </div>
  );
}

function EmployerDashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Jobseeker[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          // Not authenticated - redirect to employer landing
          router.push("/employer");
          return;
        }

        if (userProfile.role !== "employer") {
          // Wrong role - redirect to correct dashboard
          router.push("/jobseeker/dashboard");
          return;
        }

        const employerProfile = await getMyEmployerProfile();
        if (!employerProfile) {
          // Redirect to onboarding if no profile
          // Determine which type based on user metadata
          const user = userProfile.user;
          const employerType = user?.user_metadata?.employerType;
          if (employerType === "company") {
            router.push("/employer/company/details");
          } else if (employerType === "individual") {
            router.push("/employer/individual/details");
          } else {
            router.push("/employer");
          }
          return;
        }

        setEmployer(employerProfile);

        // Identify user (PostHog funnel tracking)
        if (userProfile.user?.id) {
          identifyUser(userProfile.user.id, 'employer');
        }

        setLoading(false);
      } catch (err) {
        console.error("[EmployerDashboard] Error loading dashboard:", err);
        setError("Failed to load dashboard. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const keywords = formData.get("search") as string;
    const city = formData.get("city") as string;
    const minYears = formData.get("yearsMin") as string;
    const maxYears = formData.get("yearsMax") as string;

    const filters: JobseekerSearchFilters = {};

    if (keywords) filters.keywords = keywords;
    if (city) filters.city = city;
    if (minYears) filters.minYearsExperience = parseInt(minYears);
    if (maxYears) filters.maxYearsExperience = parseInt(maxYears);

    try {
      const searchResults = await searchJobseekers(filters);
      setResults(searchResults.jobseekers);
      setTotalResults(searchResults.total);
      setHasSearched(true);

      trackEvent("search_performed", {
        userRole: "employer",
        metadata: { resultsCount: searchResults.total },
      });

      // Track search performed (PostHog funnel tracking)
      trackSearchPerformed();
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  function handleClearFilters() {
    setHasSearched(false);
    setResults([]);
    setTotalResults(0);
  }

  if (loading) {
    return (
      <main>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Employer Dashboard</h1>
          <p>Search CVs directly. Find the right candidates.</p>
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

      {/* Success Message - wrapped in Suspense */}
      <Suspense fallback={null}>
        <UpdateSuccessMessage />
      </Suspense>

      {/* Account Pending Verification Notice - prominent banner for unverified accounts */}
      {employer && !employer.is_verified && employer.verification_status !== "rejected" && (
        <div role="status" className="alert alert-warning alert-prominent">
          <h2>Account Pending Verification</h2>
          <p>
            Your employer account is currently being reviewed by our team. You will be able to search and view candidate CVs once your account has been verified.
          </p>
          <p style={{ color: "var(--sv-muted)" }}>
            This process typically takes 1-2 business days. We&apos;ll notify you via email once your account is approved.
          </p>
          <p style={{ marginTop: "var(--space-md)" }}>
            <Link href="/employer/profile">View Your Profile</Link>
          </p>
        </div>
      )}

      {/* Profile Rejected Notice */}
      {employer && employer.verification_status === "rejected" && (
        <div role="alert" className="alert alert-error">
          <h3>Profile Verification Failed</h3>
          <p>
            Your profile verification was not approved. Please update your profile with accurate information and resubmit for review.
          </p>
          {employer.verification_notes && (
            <p>
              <strong>Reason:</strong> {employer.verification_notes}
            </p>
          )}
          <p>
            {employer.employer_type === "company" ? (
              <Link href="/employer/company/edit-profile">Update Profile</Link>
            ) : (
              <Link href="/employer/individual/edit-profile">Update Profile</Link>
            )}
          </p>
        </div>
      )}

      {error && (
        <div role="alert" style={{ marginBottom: "var(--space-lg)", color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      {/* Quick Navigation */}
      <section aria-label="Quick Navigation">
        <h2>Navigation</h2>
        <nav>
          <ul>
            <li>
              <Link href="/messages">Messages</Link>
            </li>
            <li>
              <Link href="/employer/profile">Your Profile</Link>
            </li>
            <li>
              <Link href="/employer/saved-cvs">Saved CVs</Link>
            </li>
            <li>
              <Link href="/employer/interviews">Scheduled Interviews</Link>
            </li>
          </ul>
        </nav>
      </section>

      {/* Search Section */}
      <section aria-label="Talent Search" style={!employer?.is_verified ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
        <h2>Search Talent</h2>

        <div className="card">
          <form onSubmit={handleSearch}>
            <div style={{ marginBottom: "var(--space-md)" }}>
              <label htmlFor="search">Keywords</label>
              <div style={{ display: "flex", gap: "var(--space-md)" }}>
                <input
                  type="search"
                  id="search"
                  name="search"
                  placeholder={employer?.is_verified ? "Skills, role, or keywords" : "Verification required to search"}
                  autoFocus={employer?.is_verified}
                  style={{ flex: 1 }}
                  disabled={!employer?.is_verified}
                />
                <button type="submit" disabled={searching || !employer?.is_verified}>
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Filters Section */}
      <section aria-label="Search Filters" style={!employer?.is_verified ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
        <h2>Filters</h2>

        <div className="card">
          <form onSubmit={handleSearch}>
            <div className="filter-grid">
              <div>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="e.g. San Francisco"
                  disabled={!employer?.is_verified}
                />
              </div>

              <div>
                <label htmlFor="desiredRole">Role</label>
                <input
                  type="text"
                  id="desiredRole"
                  name="desiredRole"
                  placeholder="e.g. Software Engineer"
                  disabled={!employer?.is_verified}
                />
              </div>

              <div>
                <label htmlFor="skills">Skills</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  placeholder="e.g. Python, React, AWS"
                  disabled={!employer?.is_verified}
                />
              </div>

              <div>
                <label htmlFor="yearsMin">Years of Experience</label>
                <div className="age-inputs">
                  <input
                    type="number"
                    id="yearsMin"
                    name="yearsMin"
                    min="0"
                    max="50"
                    placeholder="Min"
                    disabled={!employer?.is_verified}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    id="yearsMax"
                    name="yearsMax"
                    min="0"
                    max="50"
                    placeholder="Max"
                    disabled={!employer?.is_verified}
                  />
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button type="submit" disabled={searching || !employer?.is_verified}>
                {searching ? "Applying..." : "Apply Filters"}
              </button>
              <button type="button" onClick={handleClearFilters} disabled={!employer?.is_verified}>
                Clear
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section aria-label="Search Results">
        <h2>Results</h2>

        {/* Show verification required message for unverified accounts */}
        {!employer?.is_verified && (
          <div className="alert alert-warning">
            <h3>Account Verification Required</h3>
            <p>
              You need to complete account verification before you can search and view candidate CVs. This helps us maintain a safe and trusted platform for all users.
            </p>
          </div>
        )}

        {employer?.is_verified && !hasSearched && (
          <div className="card empty-state">
            <p>
              <strong>Start by searching or filtering above.</strong>
            </p>
            <ul style={{ textAlign: "left", display: "inline-block" }}>
              <li>Search by skills, role, or keywords</li>
              <li>Filter by city or experience level</li>
              <li>Only visible profiles are shown</li>
            </ul>
          </div>
        )}

        {employer?.is_verified && hasSearched && results.length === 0 && (
          <div className="card empty-state">
            <p>
              <strong>No candidates match your criteria.</strong>
            </p>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        )}

        {employer?.is_verified && hasSearched && results.length > 0 && (
          <>
            <p>
              <strong>
                {totalResults} candidate{totalResults !== 1 ? "s" : ""} found
              </strong>
            </p>

            <div className="results-list">
              {results.map((jobseeker) => {
                const preview = jobseekerToPreview(jobseeker);
                return (
                  <article key={jobseeker.id} className="result-item">
                    <CVPreviewCard candidate={preview} />
                    <div style={{ marginTop: "var(--space-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p className="last-updated" style={{ margin: 0 }}>
                        Last updated: {formatLastUpdated(preview.lastUpdated)}
                      </p>
                      <div>
                        <Link href={`/cv/${jobseeker.id}`}>View CV</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function EmployerDashboardPage() {
  return (
    <Suspense fallback={<main><p>Loading dashboard...</p></main>}>
      <EmployerDashboardContent />
    </Suspense>
  );
}
