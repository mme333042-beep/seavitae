/**
 * Role-adaptive CV layout
 *
 * Different professions read best with different section names and emphasis.
 * A Product Manager benefits from a "Key Achievements" block; a developer
 * leans on "Technical Skills" and projects; an academic on publications.
 *
 * This module classifies a free-text role into a category and returns the
 * section labels + which optional blocks to surface. It also derives a
 * "Key Achievements" list from the user's existing experience bullets, so no
 * extra input fields are required.
 */

export type RoleCategory =
  | "management"
  | "engineering"
  | "design"
  | "academic"
  | "sales_marketing"
  | "general";

export interface CVSectionLabels {
  /** Sidebar achievements/highlights heading */
  achievements: string;
  /** Whether to surface the derived achievements block for this role */
  showAchievements: boolean;
  /** Skills section heading (varies by profession) */
  skills: string;
  /** Main-column section headings */
  summary: string;
  experience: string;
  education: string;
}

/** Keyword groups used to classify a free-text role. Order matters: first match wins. */
const ROLE_KEYWORDS: { category: RoleCategory; keywords: string[] }[] = [
  {
    category: "management",
    keywords: [
      "manager", "management", "product", "lead", "director", "head",
      "chief", "founder", "ceo", "coo", "cto", "cfo", "vp", "vice president",
      "principal", "owner", "scrum master", "program",
    ],
  },
  {
    category: "engineering",
    keywords: [
      "engineer", "engineering", "developer", "software", "programmer",
      "data", "devops", "sre", "qa", "architect", "backend", "back-end",
      "frontend", "front-end", "fullstack", "full-stack", "analyst",
      "machine learning", "ml", "ai",
    ],
  },
  {
    category: "design",
    keywords: [
      "design", "designer", "ux", "ui", "creative", "artist", "illustrator",
      "animator", "brand", "motion", "graphic",
    ],
  },
  {
    category: "academic",
    keywords: [
      "research", "researcher", "scientist", "professor", "lecturer",
      "phd", "postdoc", "academic", "fellow",
    ],
  },
  {
    category: "sales_marketing",
    keywords: [
      "sales", "marketing", "growth", "account", "business development",
      "seo", "content", "social media", "copywriter", "brand strategist",
    ],
  },
];

/**
 * Classify a free-text job role into a layout category.
 */
export function classifyRole(role: string): RoleCategory {
  const normalized = (role || "").toLowerCase();
  if (!normalized.trim()) return "general";

  for (const { category, keywords } of ROLE_KEYWORDS) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      return category;
    }
  }
  return "general";
}

const LABELS_BY_CATEGORY: Record<RoleCategory, CVSectionLabels> = {
  management: {
    achievements: "Key Achievements",
    showAchievements: true,
    skills: "Core Competencies",
    summary: "Professional Summary",
    experience: "Experience",
    education: "Education",
  },
  sales_marketing: {
    achievements: "Key Achievements",
    showAchievements: true,
    skills: "Core Competencies",
    summary: "Professional Summary",
    experience: "Experience",
    education: "Education",
  },
  engineering: {
    achievements: "Highlights",
    showAchievements: true,
    skills: "Technical Skills",
    summary: "Professional Summary",
    experience: "Experience",
    education: "Education",
  },
  design: {
    achievements: "Highlights",
    showAchievements: false,
    skills: "Skills & Tools",
    summary: "Profile",
    experience: "Experience",
    education: "Education",
  },
  academic: {
    achievements: "Research Highlights",
    showAchievements: false,
    skills: "Areas of Expertise",
    summary: "Research Profile",
    experience: "Experience",
    education: "Education",
  },
  general: {
    achievements: "Highlights",
    showAchievements: false,
    skills: "Skills",
    summary: "Professional Summary",
    experience: "Experience",
    education: "Education",
  },
};

/**
 * Get the section labels + emphasis for a given role.
 */
export function getSectionLabels(role: string): CVSectionLabels {
  return LABELS_BY_CATEGORY[classifyRole(role)];
}

/** Verbs that signal a concrete accomplishment rather than a responsibility. */
const IMPACT_VERBS = [
  "led", "launched", "grew", "increased", "reduced", "drove", "delivered",
  "scaled", "built", "generated", "improved", "achieved", "won", "exceeded",
  "saved", "raised", "boosted", "cut", "shipped", "spearheaded", "secured",
  "expanded", "accelerated", "doubled", "tripled",
];

interface ExperienceLike {
  description?: string | null;
}

/**
 * Derive a short "Key Achievements" list from existing experience bullets.
 *
 * Lines that contain a number/percentage or a strong impact verb are treated
 * as achievements. Lines with quantified results (numbers) rank first.
 * Returns trimmed, de-duplicated bullet text — never throws on empty input.
 */
export function extractKeyAchievements(
  experiences: ExperienceLike[],
  max = 3
): string[] {
  if (!Array.isArray(experiences) || experiences.length === 0) return [];

  const candidates: { text: string; hasNumber: boolean }[] = [];
  const seen = new Set<string>();

  for (const exp of experiences) {
    const description = exp?.description;
    if (!description) continue;

    // Split into individual bullet lines on bullet chars or newlines.
    const lines = description
      .split(/[•\n]/)
      .map((line) => line.replace(/^[\s\-*•]+/, "").trim())
      .filter((line) => line.length > 0);

    for (const line of lines) {
      const lower = line.toLowerCase();
      const hasNumber = /\d/.test(line);
      const hasImpactVerb = IMPACT_VERBS.some((verb) =>
        new RegExp(`\\b${verb}\\b`).test(lower)
      );

      // Keep meaningful-length lines that show measurable or action-led impact.
      if ((hasNumber || hasImpactVerb) && line.length >= 15) {
        const key = lower.replace(/\s+/g, " ");
        if (!seen.has(key)) {
          seen.add(key);
          candidates.push({ text: line, hasNumber });
        }
      }
    }
  }

  // Quantified achievements first, preserving original order within each group.
  const quantified = candidates.filter((c) => c.hasNumber).map((c) => c.text);
  const qualitative = candidates.filter((c) => !c.hasNumber).map((c) => c.text);

  return [...quantified, ...qualitative].slice(0, max);
}
