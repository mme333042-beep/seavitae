/**
 * SeaVitae Search Ranking Logic (V1)
 *
 * Ranking factors:
 * 1. Keyword relevance (40%) - matches in role, skills, bio
 * 2. Profile completeness (30%) - how complete the profile is
 * 3. Recency (20%) - when profile was last updated
 * 4. Discovery status (10%) - actively open to discovery
 *
 * No paid boosts or promoted profiles.
 */

export interface RankableProfile {
  id: string;
  fullName: string;
  city: string;
  preferredRole: string;
  skills: string[];
  bio: string;
  lastUpdated: Date;
  isOpenToDiscovery: boolean;
  // Profile completeness fields
  hasExperience: boolean;
  hasEducation: boolean;
  hasCertifications: boolean;
  hasProjects: boolean;
  hasPublications: boolean;
  hasLanguages: boolean;
}

export interface RankedProfile extends RankableProfile {
  score: number;
  relevanceScore: number;
  completenessScore: number;
  recencyScore: number;
  discoveryScore: number;
}

export interface SearchQuery {
  keywords: string;
  city?: string;
  minAge?: number;
  maxAge?: number;
  desiredRole?: string;
  skills?: string;
}

// Scoring weights
const WEIGHTS = {
  relevance: 0.4,
  completeness: 0.3,
  recency: 0.2,
  discovery: 0.1,
};

/**
 * Calculate keyword relevance score (0-100)
 * Matches keywords against role, skills, and bio
 */
function calculateRelevanceScore(
  profile: RankableProfile,
  query: SearchQuery
): number {
  if (!query.keywords && !query.desiredRole && !query.skills) {
    return 50; // Neutral score when no keywords provided
  }

  const searchTerms: string[] = [];

  if (query.keywords) {
    searchTerms.push(
      ...query.keywords.toLowerCase().split(/[\s,]+/).filter(Boolean)
    );
  }
  if (query.desiredRole) {
    searchTerms.push(
      ...query.desiredRole.toLowerCase().split(/[\s,]+/).filter(Boolean)
    );
  }
  if (query.skills) {
    searchTerms.push(
      ...query.skills.toLowerCase().split(/[\s,]+/).filter(Boolean)
    );
  }

  if (searchTerms.length === 0) {
    return 50;
  }

  let matchCount = 0;
  let totalPossibleMatches = searchTerms.length * 3; // 3 fields to match against

  const roleLower = profile.preferredRole.toLowerCase();
  const skillsLower = profile.skills.map((s) => s.toLowerCase());
  const bioLower = profile.bio.toLowerCase();

  for (const term of searchTerms) {
    // Role match (highest weight - counts as 1.5 matches)
    if (roleLower.includes(term)) {
      matchCount += 1.5;
    }

    // Skills match (high weight - counts as 1.25 matches per skill)
    const skillMatches = skillsLower.filter((skill) =>
      skill.includes(term)
    ).length;
    matchCount += skillMatches * 1.25;

    // Bio match (standard weight)
    if (bioLower.includes(term)) {
      matchCount += 1;
    }
  }

  // Normalize to 0-100
  const score = Math.min(100, (matchCount / totalPossibleMatches) * 100);
  return Math.round(score);
}

/**
 * Calculate profile completeness score (0-100)
 * Based on which sections are filled out
 */
function calculateCompletenessScore(profile: RankableProfile): number {
  const sections = [
    { filled: Boolean(profile.fullName), weight: 15 },
    { filled: Boolean(profile.city), weight: 10 },
    { filled: Boolean(profile.preferredRole), weight: 15 },
    { filled: Boolean(profile.bio), weight: 15 },
    { filled: profile.skills.length > 0, weight: 15 },
    { filled: profile.hasExperience, weight: 10 },
    { filled: profile.hasEducation, weight: 5 },
    { filled: profile.hasCertifications, weight: 5 },
    { filled: profile.hasProjects, weight: 5 },
    { filled: profile.hasPublications, weight: 3 },
    { filled: profile.hasLanguages, weight: 2 },
  ];

  const score = sections.reduce((total, section) => {
    return total + (section.filled ? section.weight : 0);
  }, 0);

  return score;
}

/**
 * Calculate recency score (0-100)
 * Profiles updated more recently score higher
 */
function calculateRecencyScore(profile: RankableProfile): number {
  const now = new Date();
  const lastUpdated = new Date(profile.lastUpdated);
  const daysSinceUpdate = Math.floor(
    (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Scoring tiers:
  // 0-7 days: 100 points
  // 8-30 days: 80 points
  // 31-90 days: 60 points
  // 91-180 days: 40 points
  // 181-365 days: 20 points
  // 365+ days: 10 points

  if (daysSinceUpdate <= 7) return 100;
  if (daysSinceUpdate <= 30) return 80;
  if (daysSinceUpdate <= 90) return 60;
  if (daysSinceUpdate <= 180) return 40;
  if (daysSinceUpdate <= 365) return 20;
  return 10;
}

/**
 * Calculate discovery status score (0-100)
 * Profiles actively open to discovery score higher
 */
function calculateDiscoveryScore(profile: RankableProfile): number {
  return profile.isOpenToDiscovery ? 100 : 0;
}

/**
 * Calculate the total ranking score for a profile
 */
function calculateTotalScore(
  profile: RankableProfile,
  query: SearchQuery
): RankedProfile {
  const relevanceScore = calculateRelevanceScore(profile, query);
  const completenessScore = calculateCompletenessScore(profile);
  const recencyScore = calculateRecencyScore(profile);
  const discoveryScore = calculateDiscoveryScore(profile);

  const score = Math.round(
    relevanceScore * WEIGHTS.relevance +
      completenessScore * WEIGHTS.completeness +
      recencyScore * WEIGHTS.recency +
      discoveryScore * WEIGHTS.discovery
  );

  return {
    ...profile,
    score,
    relevanceScore,
    completenessScore,
    recencyScore,
    discoveryScore,
  };
}

/**
 * Filter profiles based on search criteria
 */
function filterProfiles(
  profiles: RankableProfile[],
  query: SearchQuery
): RankableProfile[] {
  return profiles.filter((profile) => {
    // Only include profiles open to discovery
    if (!profile.isOpenToDiscovery) {
      return false;
    }

    // Filter by city if specified
    if (query.city) {
      const cityMatch = profile.city
        .toLowerCase()
        .includes(query.city.toLowerCase());
      if (!cityMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Search and rank profiles based on query
 * Returns profiles sorted by score (highest first)
 */
export function searchAndRankProfiles(
  profiles: RankableProfile[],
  query: SearchQuery
): RankedProfile[] {
  // Step 1: Filter profiles (discovery status, location)
  const filteredProfiles = filterProfiles(profiles, query);

  // Step 2: Score each profile
  const rankedProfiles = filteredProfiles.map((profile) =>
    calculateTotalScore(profile, query)
  );

  // Step 3: Sort by score (descending)
  rankedProfiles.sort((a, b) => b.score - a.score);

  return rankedProfiles;
}

/**
 * Get a human-readable explanation of ranking factors
 */
export function explainRanking(profile: RankedProfile): string {
  const factors: string[] = [];

  if (profile.relevanceScore >= 70) {
    factors.push("High keyword relevance");
  } else if (profile.relevanceScore >= 40) {
    factors.push("Moderate keyword relevance");
  }

  if (profile.completenessScore >= 80) {
    factors.push("Complete profile");
  } else if (profile.completenessScore >= 50) {
    factors.push("Partially complete profile");
  }

  if (profile.recencyScore >= 80) {
    factors.push("Recently updated");
  }

  if (profile.discoveryScore === 100) {
    factors.push("Actively seeking opportunities");
  }

  return factors.length > 0
    ? factors.join(" | ")
    : "Basic profile match";
}
