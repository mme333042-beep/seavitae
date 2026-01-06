"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import CVPreviewCard, { CVPreview } from "@/components/CVPreviewCard";
import {
  searchAndRankProfiles,
  RankableProfile,
  RankedProfile,
  SearchQuery,
  explainRanking,
} from "@/lib/searchRanking";
import { trackEvent } from "@/lib/analytics";

// Mock profiles with full ranking data
const mockProfiles: RankableProfile[] = [
  {
    id: "1",
    fullName: "John Doe",
    city: "San Francisco",
    preferredRole: "Senior Machine Learning Engineer",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "AWS"],
    bio: "Senior Machine Learning Engineer with 8 years of experience designing and deploying AI systems at scale. Led the development of recommendation algorithms serving 50M+ users.",
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isOpenToDiscovery: true,
    hasExperience: true,
    hasEducation: true,
    hasCertifications: true,
    hasProjects: true,
    hasPublications: true,
    hasLanguages: true,
  },
  {
    id: "2",
    fullName: "Jane Smith",
    city: "New York",
    preferredRole: "Full Stack Developer",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
    bio: "Full Stack Developer with expertise in building scalable web applications. Passionate about clean code and user experience. 6 years of experience in fintech.",
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isOpenToDiscovery: true,
    hasExperience: true,
    hasEducation: true,
    hasCertifications: false,
    hasProjects: true,
    hasPublications: false,
    hasLanguages: true,
  },
  {
    id: "3",
    fullName: "Michael Chen",
    city: "Seattle",
    preferredRole: "Data Scientist",
    skills: ["Python", "R", "SQL", "Machine Learning", "Tableau"],
    bio: "Data Scientist specializing in predictive analytics and business intelligence. Experience in e-commerce and retail analytics.",
    lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    isOpenToDiscovery: true,
    hasExperience: true,
    hasEducation: true,
    hasCertifications: true,
    hasProjects: false,
    hasPublications: false,
    hasLanguages: false,
  },
  {
    id: "4",
    fullName: "Sarah Johnson",
    city: "Austin",
    preferredRole: "Product Manager",
    skills: ["Product Strategy", "Agile", "User Research", "Roadmapping"],
    bio: "Product Manager with 5 years of experience in B2B SaaS. Skilled at translating customer needs into product features.",
    lastUpdated: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    isOpenToDiscovery: true,
    hasExperience: true,
    hasEducation: true,
    hasCertifications: false,
    hasProjects: false,
    hasPublications: false,
    hasLanguages: false,
  },
  {
    id: "5",
    fullName: "David Williams",
    city: "Chicago",
    preferredRole: "DevOps Engineer",
    skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
    bio: "DevOps Engineer focused on building reliable and scalable infrastructure. Experience with high-availability systems.",
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isOpenToDiscovery: true,
    hasExperience: true,
    hasEducation: true,
    hasCertifications: true,
    hasProjects: true,
    hasPublications: false,
    hasLanguages: true,
  },
];

function toPreview(profile: RankedProfile): CVPreview {
  return {
    id: profile.id,
    fullName: profile.fullName,
    city: profile.city,
    preferredRole: profile.preferredRole,
    skills: profile.skills,
    bio: profile.bio,
  };
}

export default function EmployerDashboardPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<RankedProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    keywords: "",
  });

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const query: SearchQuery = {
      keywords: formData.get("search") as string,
      city: formData.get("city") as string,
      desiredRole: formData.get("desiredRole") as string,
      skills: formData.get("skills") as string,
    };

    setSearchQuery(query);
    const rankedResults = searchAndRankProfiles(mockProfiles, query);
    setResults(rankedResults);
    setHasSearched(true);

    trackEvent("search_performed", {
      userRole: "employer",
      metadata: { resultsCount: rankedResults.length },
    });
  }

  function handleClearFilters() {
    setHasSearched(false);
    setResults([]);
    setSearchQuery({ keywords: "" });
  }

  return (
    <main>
      {/* Header */}
      <header>
        <h1>Employer Dashboard</h1>
        <p>Search CVs directly. Find the right candidates.</p>
      </header>

      {/* Quick Navigation */}
      <nav aria-label="Dashboard Navigation">
        <ul>
          <li>
            <Link href="/messages">Messages</Link>
          </li>
          <li>
            <Link href="/employer/profile">Your Profile</Link>
          </li>
        </ul>
      </nav>

      {/* Search Section */}
      <section aria-label="Talent Search">
        <h2>Search Talent</h2>

        <form onSubmit={handleSearch}>
          <div>
            <label htmlFor="search">Keywords</label>
            <input
              type="search"
              id="search"
              name="search"
              placeholder="Skills, role, or keywords"
              autoFocus
            />
            <button type="submit">Search</button>
          </div>
        </form>
      </section>

      {/* Filters Section */}
      <section aria-label="Search Filters">
        <h2>Filters</h2>

        <form onSubmit={handleSearch}>
          <div className="filter-grid">
            <div>
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="e.g. San Francisco"
              />
            </div>

            <div>
              <label htmlFor="desiredRole">Role</label>
              <input
                type="text"
                id="desiredRole"
                name="desiredRole"
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div>
              <label htmlFor="skills">Skills</label>
              <input
                type="text"
                id="skills"
                name="skills"
                placeholder="e.g. Python, React, AWS"
              />
            </div>

            <div>
              <label htmlFor="ageMin">Age Range</label>
              <div className="age-inputs">
                <input
                  type="number"
                  id="ageMin"
                  name="ageMin"
                  min="16"
                  max="100"
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  id="ageMax"
                  name="ageMax"
                  min="16"
                  max="100"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button type="submit">Apply Filters</button>
            <button type="button" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* Results Section */}
      <section aria-label="Search Results">
        <h2>Results</h2>

        {!hasSearched && (
          <div className="empty-state">
            <p>Start by searching or filtering above.</p>
            <ul>
              <li>Search by skills, role, or keywords</li>
              <li>Filter by city or age range</li>
              <li>Results are ranked by relevance</li>
            </ul>
          </div>
        )}

        {hasSearched && results.length === 0 && (
          <div className="empty-state">
            <p>No candidates match your criteria.</p>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        )}

        {hasSearched && results.length > 0 && (
          <>
            <p>
              <strong>
                {results.length} candidate{results.length !== 1 ? "s" : ""} found
              </strong>
            </p>

            <details>
              <summary>How ranking works</summary>
              <ul>
                <li>Keyword relevance (40%)</li>
                <li>Profile completeness (30%)</li>
                <li>Recency of updates (20%)</li>
                <li>Discovery status (10%)</li>
              </ul>
              <p>
                <small>No paid boosts or promotions.</small>
              </p>
            </details>

            <div className="results-list">
              {results.map((profile) => (
                <article key={profile.id} className="result-item">
                  <CVPreviewCard candidate={toPreview(profile)} />
                  <p>
                    <small>
                      Score: {profile.score}/100 &mdash; {explainRanking(profile)}
                    </small>
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
