/**
 * CV Enhancer Module
 *
 * Enhances CV content at the data level for improved ATS compatibility
 * and professional presentation. Does NOT modify PDF generation or visual layout.
 *
 * All transformations are deterministic, minimal, and preserve user intent.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: number;
}

export interface SkillItem {
  id: string;
  name: string;
  level?: string;
  category?: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  url: string;
}

export interface CVData {
  fullName: string;
  email: string;
  city: string;
  preferredRole: string;
  summary: string;
  yearsExperience: number;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  publications: PublicationItem[];
}

export interface EnhancedCVData extends CVData {
  _enhanced: true;
  _enhancementTimestamp: string;
}

// ============================================================================
// INDUSTRY KEYWORDS DATABASE
// ============================================================================

const ROLE_KEYWORDS: Record<string, string[]> = {
  // Software Engineering
  'software engineer': ['software development', 'agile', 'code review', 'version control', 'CI/CD', 'debugging', 'testing', 'problem-solving'],
  'software developer': ['software development', 'agile', 'code review', 'version control', 'CI/CD', 'debugging', 'testing', 'problem-solving'],
  'frontend developer': ['responsive design', 'user experience', 'cross-browser compatibility', 'performance optimization', 'accessibility', 'UI/UX'],
  'backend developer': ['API development', 'database design', 'server management', 'scalability', 'security', 'microservices'],
  'full stack developer': ['full stack development', 'API integration', 'database management', 'frontend', 'backend', 'deployment'],
  'devops engineer': ['infrastructure', 'automation', 'deployment', 'monitoring', 'containerization', 'cloud services'],
  'data scientist': ['data analysis', 'machine learning', 'statistical modeling', 'data visualization', 'predictive analytics'],
  'data analyst': ['data analysis', 'reporting', 'data visualization', 'SQL', 'business intelligence', 'insights'],
  'mobile developer': ['mobile development', 'cross-platform', 'app store deployment', 'mobile UI/UX', 'performance optimization'],

  // Design
  'ui designer': ['user interface design', 'visual design', 'design systems', 'prototyping', 'wireframing', 'user research'],
  'ux designer': ['user experience', 'user research', 'usability testing', 'information architecture', 'interaction design'],
  'graphic designer': ['visual design', 'branding', 'typography', 'layout design', 'creative direction'],
  'product designer': ['product design', 'user-centered design', 'design thinking', 'prototyping', 'stakeholder collaboration'],

  // Marketing
  'marketing manager': ['campaign management', 'brand strategy', 'market analysis', 'ROI optimization', 'team leadership'],
  'digital marketer': ['digital marketing', 'SEO', 'SEM', 'social media marketing', 'content strategy', 'analytics'],
  'content writer': ['content creation', 'copywriting', 'SEO writing', 'editorial planning', 'brand voice'],
  'social media manager': ['social media strategy', 'community management', 'content calendar', 'engagement metrics', 'brand awareness'],

  // Finance
  'accountant': ['financial reporting', 'bookkeeping', 'tax compliance', 'auditing', 'financial analysis'],
  'financial analyst': ['financial modeling', 'forecasting', 'budgeting', 'investment analysis', 'risk assessment'],

  // HR
  'hr manager': ['talent acquisition', 'employee relations', 'performance management', 'HR policies', 'compliance'],
  'recruiter': ['talent sourcing', 'candidate screening', 'interview coordination', 'employer branding', 'ATS management'],

  // Operations
  'project manager': ['project planning', 'stakeholder management', 'risk mitigation', 'resource allocation', 'timeline management'],
  'operations manager': ['process optimization', 'team management', 'KPI tracking', 'resource planning', 'quality assurance'],
  'business analyst': ['requirements gathering', 'process mapping', 'stakeholder analysis', 'solution design', 'documentation'],

  // Sales
  'sales manager': ['sales strategy', 'team leadership', 'revenue growth', 'client relationships', 'pipeline management'],
  'sales representative': ['lead generation', 'client acquisition', 'negotiation', 'CRM management', 'quota achievement'],

  // Customer Service
  'customer service': ['customer support', 'issue resolution', 'client communication', 'service excellence', 'problem-solving'],

  // Healthcare
  'nurse': ['patient care', 'clinical assessment', 'medication administration', 'care coordination', 'documentation'],
  'doctor': ['patient diagnosis', 'treatment planning', 'clinical care', 'medical documentation', 'patient education'],

  // Education
  'teacher': ['curriculum development', 'classroom management', 'student assessment', 'differentiated instruction', 'educational technology'],

  // Engineering (non-software)
  'mechanical engineer': ['CAD design', 'product development', 'manufacturing processes', 'quality control', 'technical documentation'],
  'electrical engineer': ['circuit design', 'systems integration', 'testing', 'technical specifications', 'troubleshooting'],
  'civil engineer': ['structural design', 'project management', 'site supervision', 'regulatory compliance', 'technical drawings'],
};

// Common technical skills by category
const TECHNICAL_SKILLS_BY_ROLE: Record<string, string[]> = {
  'software': ['Git', 'Agile/Scrum', 'REST APIs', 'Unit Testing', 'Code Review'],
  'frontend': ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Web Performance'],
  'backend': ['Database Management', 'API Design', 'Server Administration', 'Security Best Practices'],
  'data': ['SQL', 'Data Visualization', 'Statistical Analysis', 'ETL Processes'],
  'design': ['Design Systems', 'User Research', 'Prototyping', 'Visual Design Principles'],
  'marketing': ['Google Analytics', 'SEO/SEM', 'Content Management', 'Marketing Automation'],
  'management': ['Team Leadership', 'Strategic Planning', 'Budget Management', 'Stakeholder Communication'],
};

// Soft skills that are universally valuable
const UNIVERSAL_SOFT_SKILLS = [
  'Communication',
  'Problem-solving',
  'Team Collaboration',
  'Time Management',
  'Adaptability',
];

// ============================================================================
// ATS CONTENT LIMITS (Layout Safety)
// ============================================================================

const ATS_LIMITS = {
  SUMMARY_MAX_WORDS: 80,
  SUMMARY_MIN_WORDS: 60,
  SUMMARY_MAX_LINES: 5,
  EXPERIENCE_MAX_BULLETS: 4,
  BULLET_MAX_WORDS: 25, // ~1 line
  SKILL_MAX_WORDS: 2,
  MAX_SKILLS_TO_ADD: 3, // Prevent content expansion
  MAX_KEYWORDS_TO_ADD: 2, // Prevent keyword stuffing
};

// Vague/filler skills to remove
const FILLER_SKILLS = [
  'hardworking', 'hard working', 'fast learner', 'quick learner',
  'team player', 'good communicator', 'self-motivated', 'motivated',
  'detail oriented', 'detail-oriented', 'results driven', 'results-driven',
  'go-getter', 'people person', 'multitasker', 'multi-tasker',
  'dedicated', 'passionate', 'enthusiastic', 'eager',
  'responsible', 'reliable', 'punctual', 'honest',
  'flexible', 'creative thinker', 'critical thinker',
  'ms office', 'microsoft office', 'word', 'excel', 'powerpoint',
  'internet', 'email', 'typing', 'computer skills', 'basic computer',
  'windows', 'mac', 'google', 'social media',
];

// ============================================================================
// WEAK PHRASES TO REMOVE/REPLACE
// ============================================================================

const WEAK_PHRASES: { pattern: RegExp; replacement: string }[] = [
  // Job-seeking desperation phrases
  { pattern: /\bi am looking for (a |an )?job\b/gi, replacement: '' },
  { pattern: /\bi need (a |an )?opportunity\b/gi, replacement: '' },
  { pattern: /\bi am seeking (a |an )?position\b/gi, replacement: '' },
  { pattern: /\blooking for (a |an )?chance\b/gi, replacement: '' },
  { pattern: /\bwilling to learn\b/gi, replacement: 'committed to continuous learning' },
  { pattern: /\bi want to work\b/gi, replacement: '' },
  { pattern: /\bi hope to\b/gi, replacement: '' },
  { pattern: /\bplease give me\b/gi, replacement: '' },
  { pattern: /\bi really want\b/gi, replacement: '' },

  // Weak qualifiers
  { pattern: /\bi think i (am|can)\b/gi, replacement: 'I' },
  { pattern: /\bi believe i (am|can)\b/gi, replacement: 'I' },
  { pattern: /\bsort of\b/gi, replacement: '' },
  { pattern: /\bkind of\b/gi, replacement: '' },
  { pattern: /\bpretty much\b/gi, replacement: '' },
  { pattern: /\bbasically\b/gi, replacement: '' },

  // Generic filler
  { pattern: /\betc\.?\b/gi, replacement: '' },
  { pattern: /\band so on\b/gi, replacement: '' },
  { pattern: /\band more\b/gi, replacement: '' },
];

// ============================================================================
// ACTION VERBS FOR EXPERIENCE DESCRIPTIONS
// ============================================================================

const WEAK_VERBS = ['did', 'made', 'worked on', 'was responsible for', 'helped with', 'assisted with', 'was involved in'];

const STRONG_ACTION_VERBS: Record<string, string[]> = {
  leadership: ['Led', 'Directed', 'Managed', 'Supervised', 'Coordinated', 'Orchestrated', 'Spearheaded'],
  achievement: ['Achieved', 'Accomplished', 'Delivered', 'Exceeded', 'Surpassed', 'Attained'],
  creation: ['Developed', 'Created', 'Designed', 'Built', 'Established', 'Launched', 'Initiated'],
  improvement: ['Improved', 'Enhanced', 'Optimized', 'Streamlined', 'Increased', 'Reduced', 'Accelerated'],
  analysis: ['Analyzed', 'Evaluated', 'Assessed', 'Researched', 'Investigated', 'Identified'],
  communication: ['Presented', 'Communicated', 'Collaborated', 'Negotiated', 'Facilitated'],
  implementation: ['Implemented', 'Executed', 'Deployed', 'Integrated', 'Configured'],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Capitalizes the first letter of each word
 */
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Normalizes location format to "City, Country" or "City, State"
 */
function normalizeLocation(location: string): string {
  if (!location) return location;

  // Trim and clean up
  let normalized = location.trim();

  // Remove extra spaces around commas
  normalized = normalized.replace(/\s*,\s*/g, ', ');

  // Capitalize properly
  normalized = normalized.split(', ').map(part => toTitleCase(part.trim())).join(', ');

  return normalized;
}

/**
 * Normalizes date format to "YYYY-MM" for consistency
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return dateStr;

  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr;

  // Try to parse various formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  return dateStr;
}

/**
 * Converts present tense to past tense for non-current roles
 */
function convertToPastTense(text: string): string {
  const presentToPast: Record<string, string> = {
    'manage': 'Managed',
    'lead': 'Led',
    'develop': 'Developed',
    'create': 'Created',
    'design': 'Designed',
    'build': 'Built',
    'implement': 'Implemented',
    'analyze': 'Analyzed',
    'improve': 'Improved',
    'coordinate': 'Coordinated',
    'work': 'Worked',
    'handle': 'Handled',
    'maintain': 'Maintained',
    'support': 'Supported',
    'assist': 'Assisted',
    'collaborate': 'Collaborated',
    'communicate': 'Communicated',
    'train': 'Trained',
    'mentor': 'Mentored',
    'oversee': 'Oversaw',
    'establish': 'Established',
    'execute': 'Executed',
    'facilitate': 'Facilitated',
    'optimize': 'Optimized',
    'streamline': 'Streamlined',
  };

  // Check if text starts with a present tense verb
  const words = text.split(' ');
  const firstWord = words[0].toLowerCase();

  if (presentToPast[firstWord]) {
    words[0] = presentToPast[firstWord];
    return words.join(' ');
  }

  return text;
}

/**
 * Attempts to add quantifiable metrics to a description
 * Only adds metrics that can be logically inferred
 */
function addInferrableMetrics(description: string, title: string): string {
  // Don't modify if already has numbers/percentages
  if (/\d+%|\d+\s*(users|clients|customers|team|projects|people)/.test(description)) {
    return description;
  }

  // Only suggest metrics for certain contexts
  const metricPatterns: { pattern: RegExp; suggestion: string }[] = [
    // Team leadership
    { pattern: /\b(led|managed|supervised)\s+(a\s+)?team\b/i, suggestion: ' of professionals' },
    // Project delivery
    { pattern: /\b(delivered|completed|finished)\s+(the\s+)?project\b/i, suggestion: ' on time and within budget' },
    // Process improvement
    { pattern: /\b(improved|enhanced|optimized)\s+(\w+\s+)?(process|workflow|efficiency)\b/i, suggestion: ', resulting in increased productivity' },
  ];

  for (const { pattern, suggestion } of metricPatterns) {
    if (pattern.test(description) && !description.includes(suggestion)) {
      // Only add if it makes sense and doesn't already exist
      description = description.replace(pattern, (match) => match + suggestion);
      break; // Only add one suggestion per description
    }
  }

  return description;
}

/**
 * Replaces weak verbs with strong action verbs
 */
function replaceWeakVerbs(text: string): string {
  let result = text;

  // Replace "was responsible for" patterns
  result = result.replace(/\bwas responsible for\s+(\w+ing)\b/gi, (_, verb) => {
    const base = verb.replace(/ing$/, '');
    return toTitleCase(base) + 'ed';
  });

  // Replace "helped with" patterns
  result = result.replace(/\bhelped (with |to )?(\w+)/gi, (_, __, action) => {
    return 'Contributed to ' + action;
  });

  // Replace "worked on" patterns
  result = result.replace(/\bworked on\b/gi, 'Developed');

  // Replace "did" at start of bullet
  result = result.replace(/^did\s+/i, 'Completed ');

  // Replace "made" at start
  result = result.replace(/^made\s+/i, 'Created ');

  return result;
}

/**
 * Cleans up grammar and punctuation
 */
function cleanupGrammar(text: string): string {
  let result = text;

  // Fix double spaces
  result = result.replace(/\s{2,}/g, ' ');

  // Fix spacing around punctuation
  result = result.replace(/\s+([.,;:!?])/g, '$1');
  result = result.replace(/([.,;:!?])(?=[A-Za-z])/g, '$1 ');

  // Ensure sentences end with period
  result = result.trim();
  if (result && !/[.!?]$/.test(result)) {
    result += '.';
  }

  // Capitalize first letter
  if (result) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  // Fix common typos/issues
  result = result.replace(/\bi\b/g, 'I'); // Capitalize standalone 'i'
  result = result.replace(/\s+\./g, '.'); // Remove space before period

  return result;
}

/**
 * Counts words in a string
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Truncates text to a maximum word count while preserving complete sentences
 */
function truncateToWordLimit(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;

  // Truncate to max words
  let truncated = words.slice(0, maxWords).join(' ');

  // Try to end at a sentence boundary
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclaim = truncated.lastIndexOf('!');
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclaim);

  if (lastSentenceEnd > truncated.length * 0.6) {
    // Only truncate to sentence if we keep at least 60% of content
    truncated = truncated.slice(0, lastSentenceEnd + 1);
  } else {
    // Otherwise just end with a period
    truncated = truncated.replace(/[,;:\s]+$/, '') + '.';
  }

  return truncated;
}

/**
 * Truncates a bullet point to approximately one line (max words)
 */
function truncateBullet(bullet: string, maxWords: number): string {
  const words = bullet.trim().split(/\s+/);
  if (words.length <= maxWords) return bullet;

  // Truncate and clean up
  let truncated = words.slice(0, maxWords).join(' ');
  truncated = truncated.replace(/[,;:\s]+$/, '');

  // Ensure it ends with a period
  if (!/[.!?]$/.test(truncated)) {
    truncated += '.';
  }

  return truncated;
}

/**
 * Validates and cleans a skill name
 * - Max 2 words
 * - No punctuation inside
 * - Normalized casing
 */
function validateSkill(skillName: string): string | null {
  // Clean and normalize
  let cleaned = skillName.trim();

  // Remove punctuation except hyphens and slashes (for things like "CI/CD")
  cleaned = cleaned.replace(/[.,;:!?'"()[\]{}]/g, '');

  // Normalize casing
  if (cleaned === cleaned.toUpperCase() && cleaned.length > 4) {
    // If all caps and longer than acronym, title case it
    cleaned = toTitleCase(cleaned);
  }

  // Check word count (max 2 words, but allow slashes like "CI/CD")
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  if (words.length > 2) {
    // Try to keep only the most meaningful 2 words
    cleaned = words.slice(0, 2).join(' ');
  }

  // Check if it's a filler skill
  const lowerCleaned = cleaned.toLowerCase();
  if (FILLER_SKILLS.some(filler => lowerCleaned === filler || lowerCleaned.includes(filler))) {
    return null; // Remove filler skills
  }

  // Minimum length check
  if (cleaned.length < 2) {
    return null;
  }

  return cleaned;
}

/**
 * Removes personal statements and filler from text
 */
function removePersonalFiller(text: string): string {
  let result = text;

  // Remove personal statements
  const personalPatterns = [
    /\bI am passionate about\b/gi,
    /\bI love\b/gi,
    /\bMy goal is to\b/gi,
    /\bI strive to\b/gi,
    /\bI am dedicated to\b/gi,
    /\bI am committed to\b/gi,
    /\bI aspire to\b/gi,
    /\bLooking to\b/gi,
    /\bSeeking to\b/gi,
    /\bExcited to\b/gi,
    /\bEager to\b/gi,
  ];

  for (const pattern of personalPatterns) {
    result = result.replace(pattern, '');
  }

  return result.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Gets relevant keywords for a role
 */
function getKeywordsForRole(role: string): string[] {
  const normalizedRole = role.toLowerCase();

  // Direct match
  if (ROLE_KEYWORDS[normalizedRole]) {
    return ROLE_KEYWORDS[normalizedRole];
  }

  // Partial match
  for (const [key, keywords] of Object.entries(ROLE_KEYWORDS)) {
    if (normalizedRole.includes(key) || key.includes(normalizedRole)) {
      return keywords;
    }
  }

  // Fallback to generic professional keywords
  return ['team collaboration', 'problem-solving', 'communication', 'project delivery'];
}

/**
 * Gets relevant technical skills based on role category
 */
function getTechnicalSkillsForRole(role: string): string[] {
  const normalizedRole = role.toLowerCase();
  const skills: string[] = [];

  // Determine categories based on role
  if (/software|developer|engineer|programmer|coding/i.test(normalizedRole)) {
    skills.push(...(TECHNICAL_SKILLS_BY_ROLE['software'] || []));
  }
  if (/frontend|front-end|ui|react|angular|vue/i.test(normalizedRole)) {
    skills.push(...(TECHNICAL_SKILLS_BY_ROLE['frontend'] || []));
  }
  if (/backend|back-end|server|api|database/i.test(normalizedRole)) {
    skills.push(...(TECHNICAL_SKILLS_BY_ROLE['backend'] || []));
  }
  if (/data|analyst|scientist|analytics/i.test(normalizedRole)) {
    skills.push(...(TECHNICAL_SKILLS_BY_ROLE['data'] || []));
  }
  if (/design|ux|ui|graphic/i.test(normalizedRole)) {
    skills.push(...(TECHNICAL_SKILLS_BY_ROLE['design'] || []));
  }
  if (/marketing|seo|content|social/i.test(normalizedRole)) {
    skills.push(...(TECHNICAL_SKILLS_BY_ROLE['marketing'] || []));
  }
  if (/manager|director|lead|head|chief/i.test(normalizedRole)) {
    skills.push(...(TECHNICAL_SKILLS_BY_ROLE['management'] || []));
  }

  return [...new Set(skills)]; // Remove duplicates
}

// ============================================================================
// MAIN ENHANCEMENT FUNCTIONS
// ============================================================================

/**
 * Enhances the professional summary
 * - Max 60-80 words, 4-5 lines
 * - Removes personal statements and filler
 * - Focuses on role, experience, and strengths
 * - Light keyword alignment (no stuffing)
 *
 * SAFETY: Always returns at least the original summary if enhancement fails
 */
export function enhanceSummary(
  summary: string,
  preferredRole: string,
  yearsExperience: number,
  email: string
): string {
  // SAFETY: Return original if input is empty
  if (!summary || summary.trim().length === 0) {
    return summary;
  }

  const originalSummary = summary.trim(); // Keep original for fallback
  let enhanced = summary;

  // 1. Remove weak phrases
  for (const { pattern, replacement } of WEAK_PHRASES) {
    enhanced = enhanced.replace(pattern, replacement);
  }

  // 2. Remove personal filler statements
  enhanced = removePersonalFiller(enhanced);

  // 3. Clean up resulting whitespace
  enhanced = enhanced.replace(/\s{2,}/g, ' ').trim();

  // SAFETY CHECK: If we've removed too much, use original
  if (enhanced.length < originalSummary.length * 0.3) {
    enhanced = originalSummary;
  }

  // 4. Remove sentences that became empty or too short (but keep at least something)
  const sentences = enhanced.split(/(?<=[.!?])\s+/)
    .filter(sentence => sentence.trim().length > 10);

  if (sentences.length > 0) {
    enhanced = sentences.join(' ');
  }
  // If no sentences pass filter, keep enhanced as-is (don't empty it)

  // SAFETY CHECK: Ensure we still have content
  if (!enhanced || enhanced.trim().length === 0) {
    enhanced = originalSummary;
  }

  // 5. Ensure it starts with a strong statement (not "I am looking...")
  if (/^I am\s/i.test(enhanced)) {
    // Transform "I am a software engineer" to "Software engineer with..."
    enhanced = enhanced.replace(/^I am (a |an )?/i, '');
    if (enhanced.length > 0) {
      enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    }
  }

  // 6. Add years of experience if not already mentioned AND if under word limit
  const currentWordCount = countWords(enhanced);
  if (yearsExperience > 0 &&
      currentWordCount < ATS_LIMITS.SUMMARY_MAX_WORDS - 10 &&
      !/\d+\s*(years?|yrs?)\s*(of)?\s*experience/i.test(enhanced)) {
    const experiencePhrase = yearsExperience === 1
      ? '1 year of experience'
      : `${yearsExperience} years of experience`;

    // Insert after first sentence or at the beginning
    const firstPeriod = enhanced.indexOf('.');
    if (firstPeriod > 0 && firstPeriod < 100) {
      enhanced = enhanced.slice(0, firstPeriod + 1) + ` Brings ${experiencePhrase} in the field.` + enhanced.slice(firstPeriod + 1);
    }
  }

  // 7. Light keyword alignment - only add if under word limit (prevent stuffing)
  const wordsAfterExp = countWords(enhanced);
  if (wordsAfterExp < ATS_LIMITS.SUMMARY_MAX_WORDS - 15) {
    const keywords = getKeywordsForRole(preferredRole);
    const summaryLower = enhanced.toLowerCase();

    // Only add keywords that aren't already present - limit to MAX_KEYWORDS_TO_ADD
    const missingKeywords = keywords
      .filter(kw => !summaryLower.includes(kw.toLowerCase()))
      .slice(0, ATS_LIMITS.MAX_KEYWORDS_TO_ADD);

    if (missingKeywords.length > 0 && !enhanced.includes('Skilled in')) {
      enhanced = enhanced.trim();
      if (!enhanced.endsWith('.')) enhanced += '.';
      enhanced += ` Skilled in ${missingKeywords.join(', ')}.`;
    }
  }

  // 8. ENFORCE WORD LIMIT - truncate intelligently if exceeded
  enhanced = truncateToWordLimit(enhanced, ATS_LIMITS.SUMMARY_MAX_WORDS);

  // 9. Final grammar cleanup
  enhanced = cleanupGrammar(enhanced);

  // FINAL SAFETY CHECK: Never return empty if original had content
  if (!enhanced || enhanced.trim().length === 0) {
    return originalSummary;
  }

  return enhanced;
}

/**
 * Enhances experience descriptions
 * - Bullet points ONLY (no paragraphs)
 * - Max 3-4 bullets per role
 * - Each bullet: one sentence, one idea, one line max
 * - Compress long input; never expand
 *
 * SAFETY: Always preserves original description if enhancement produces empty
 */
export function enhanceExperience(experiences: ExperienceItem[]): ExperienceItem[] {
  // SAFETY: Return original if input is empty
  if (!experiences || experiences.length === 0) {
    return experiences;
  }

  return experiences.map(exp => {
    const originalDescription = exp.description; // Keep for fallback

    if (!originalDescription || originalDescription.trim().length === 0) {
      return exp;
    }

    // 1. Split into bullet points - handle various formats
    let bullets = originalDescription
      .split(/[\n•\-\*]|(?<=[.!?])\s+(?=[A-Z])/) // Split on bullets, newlines, or sentence boundaries
      .map(b => b.trim())
      .filter(b => b.length > 5); // Filter out very short fragments

    // SAFETY: If splitting removed everything, use original as single bullet
    if (bullets.length === 0) {
      bullets = [originalDescription.trim()];
    }

    // 2. Enhance each bullet point
    bullets = bullets.map(bullet => {
      let enhanced = bullet;

      // Replace weak verbs with strong action verbs
      enhanced = replaceWeakVerbs(enhanced);

      // Convert to past tense if not current role
      if (!exp.current) {
        enhanced = convertToPastTense(enhanced);
      }

      // DO NOT add metrics - this could expand content
      // enhanced = addInferrableMetrics(enhanced, exp.title);

      // Truncate to one line max (BULLET_MAX_WORDS words)
      enhanced = truncateBullet(enhanced, ATS_LIMITS.BULLET_MAX_WORDS);

      // Clean up grammar
      enhanced = cleanupGrammar(enhanced);

      return enhanced;
    }).filter(b => b && b.trim().length > 0); // Remove any that became empty

    // 3. ENFORCE MAX BULLETS - keep most relevant (usually first ones)
    if (bullets.length > ATS_LIMITS.EXPERIENCE_MAX_BULLETS) {
      bullets = bullets.slice(0, ATS_LIMITS.EXPERIENCE_MAX_BULLETS);
    }

    // SAFETY: If all bullets were filtered, use original description
    if (bullets.length === 0) {
      console.warn('[CV Enhancement] Experience bullets filtered out - using original');
      bullets = [originalDescription.trim()];
    }

    // 4. Rejoin bullets with newlines (bullet point format)
    const enhancedDescription = bullets.join('\n');

    // 5. Normalize dates and location (with safety fallbacks)
    const enhancedLocation = normalizeLocation(exp.location) || exp.location;
    const enhancedStartDate = normalizeDate(exp.startDate) || exp.startDate;
    const enhancedEndDate = exp.current ? '' : (normalizeDate(exp.endDate) || exp.endDate);

    return {
      ...exp,
      description: enhancedDescription || originalDescription, // Final fallback
      location: enhancedLocation,
      startDate: enhancedStartDate,
      endDate: enhancedEndDate,
    };
  });
}

/**
 * Enhances skills list based on role
 * - Max 2 words per skill
 * - No duplicates
 * - No punctuation inside skills
 * - Normalized casing
 * - Remove vague filler skills
 * - Prevent content expansion
 *
 * SAFETY: Always returns at least the original skills if all get filtered
 */
export function enhanceSkills(
  skills: SkillItem[],
  preferredRole: string,
  experiences: ExperienceItem[]
): SkillItem[] {
  // SAFETY: Return original if input is empty
  if (!skills || skills.length === 0) {
    return skills;
  }

  const originalSkills = skills; // Keep for fallback
  const seenSkills = new Set<string>(); // For duplicate detection
  const validatedSkills: SkillItem[] = [];
  let removedCount = 0;

  // 1. Validate and clean existing skills
  for (const skill of skills) {
    const validated = validateSkill(skill.name);

    if (validated === null) {
      // Filler skill removed
      removedCount++;
      continue;
    }

    // Check for duplicates (case-insensitive)
    const lowerValidated = validated.toLowerCase();
    if (seenSkills.has(lowerValidated)) {
      removedCount++;
      continue;
    }

    seenSkills.add(lowerValidated);
    validatedSkills.push({
      ...skill,
      name: validated,
    });
  }

  // SAFETY CHECK: If we filtered out ALL skills, return original
  // This prevents blank PDF - user's original skills are better than nothing
  if (validatedSkills.length === 0 && originalSkills.length > 0) {
    console.warn('[CV Enhancement] All skills were filtered - returning original skills');
    return originalSkills.map(skill => ({
      ...skill,
      name: skill.name.trim(), // At least trim them
    }));
  }

  // 2. LAYOUT SAFETY: Only add skills if we removed some AND stay under limit
  const maxToAdd = Math.min(removedCount, ATS_LIMITS.MAX_SKILLS_TO_ADD);

  if (maxToAdd > 0) {
    // Get suggested skills based on role
    const suggestedTechnical = getTechnicalSkillsForRole(preferredRole);
    const experienceText = experiences.map(e => `${e.title} ${e.description}`).join(' ').toLowerCase();

    let addedCount = 0;

    // Add relevant technical skills
    for (const skill of suggestedTechnical) {
      if (addedCount >= maxToAdd) break;

      const validated = validateSkill(skill);
      if (!validated) continue;

      const lowerValidated = validated.toLowerCase();
      if (seenSkills.has(lowerValidated)) continue;

      // Only add if clearly relevant
      const isRelevant = experienceText.includes(lowerValidated) ||
        preferredRole.toLowerCase().includes(lowerValidated.split(' ')[0]);

      if (isRelevant) {
        seenSkills.add(lowerValidated);
        validatedSkills.push({
          id: crypto.randomUUID(),
          name: validated,
        });
        addedCount++;
      }
    }

    // DO NOT add universal soft skills - these are usually filler
  }

  return validatedSkills;
}

/**
 * Enhances education entries
 */
export function enhanceEducation(educations: EducationItem[]): EducationItem[] {
  return educations.map(edu => ({
    ...edu,
    degree: edu.degree.trim(),
    institution: edu.institution.trim(),
    location: normalizeLocation(edu.location),
  }));
}

/**
 * Enhances project descriptions
 */
export function enhanceProjects(projects: ProjectItem[]): ProjectItem[] {
  return projects.map(proj => {
    let description = proj.description;

    if (description) {
      // Remove weak phrases
      for (const { pattern, replacement } of WEAK_PHRASES) {
        description = description.replace(pattern, replacement);
      }
      description = cleanupGrammar(description);
    }

    return {
      ...proj,
      name: proj.name.trim(),
      description: description || '',
    };
  });
}

/**
 * Normalizes language proficiency labels
 */
export function enhanceLanguages(languages: LanguageItem[]): LanguageItem[] {
  const proficiencyMap: Record<string, string> = {
    'native': 'Native',
    'fluent': 'Fluent',
    'advanced': 'Advanced',
    'intermediate': 'Intermediate',
    'basic': 'Basic',
    'beginner': 'Basic',
    'elementary': 'Basic',
    'professional': 'Advanced',
    'working': 'Intermediate',
    'conversational': 'Intermediate',
  };

  return languages.map(lang => ({
    ...lang,
    name: toTitleCase(lang.name.trim()),
    proficiency: proficiencyMap[lang.proficiency.toLowerCase()] || lang.proficiency,
  }));
}

/**
 * Enhances certifications
 */
export function enhanceCertifications(certifications: CertificationItem[]): CertificationItem[] {
  return certifications.map(cert => ({
    ...cert,
    name: cert.name.trim(),
    issuer: cert.issuer.trim(),
    issueDate: normalizeDate(cert.issueDate),
  }));
}

// ============================================================================
// VALIDATION & SAFETY FUNCTIONS
// ============================================================================

/**
 * Checks if a string is valid (non-empty after trimming)
 */
function isValidString(str: string | undefined | null): boolean {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Checks if an array is valid (non-empty with at least one valid item)
 */
function isValidArray<T>(arr: T[] | undefined | null): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Safely falls back to original value if enhanced value is invalid
 */
function safeString(enhanced: string, original: string): string {
  return isValidString(enhanced) ? enhanced : original;
}

/**
 * Safely falls back to original array if enhanced array is empty
 */
function safeArray<T>(enhanced: T[], original: T[]): T[] {
  return isValidArray(enhanced) ? enhanced : original;
}

/**
 * Validates that enhanced CV data has all required fields
 * Returns true if data is valid for PDF generation
 */
function validateEnhancedData(data: EnhancedCVData, original: CVData): boolean {
  // Summary must not be empty if original had content
  if (isValidString(original.summary) && !isValidString(data.summary)) {
    console.warn('[CV Enhancement] Summary became empty - will use original');
    return false;
  }

  // Skills must not be empty if original had skills
  if (isValidArray(original.skills) && !isValidArray(data.skills)) {
    console.warn('[CV Enhancement] Skills became empty - will use original');
    return false;
  }

  // Experience must not be empty if original had experience
  if (isValidArray(original.experiences) && !isValidArray(data.experiences)) {
    console.warn('[CV Enhancement] Experiences became empty - will use original');
    return false;
  }

  return true;
}

// ============================================================================
// MAIN ENHANCER FUNCTION
// ============================================================================

/**
 * Main function to enhance all CV data
 * This is the entry point called during CV save
 *
 * SAFETY GUARANTEES:
 * - Summary will NEVER be empty if user provided a summary
 * - Skills array will NEVER be empty if user provided skills
 * - Experience array will NEVER be empty if user provided experience
 * - All fields fall back to original data if enhancement produces empty output
 */
export function enhanceCV(data: CVData): EnhancedCVData {
  // 1. Enhance professional summary
  let enhancedSummary: string;
  try {
    enhancedSummary = enhanceSummary(
      data.summary,
      data.preferredRole,
      data.yearsExperience,
      data.email
    );
    // DEFENSIVE: Fall back to original if enhancement produced empty
    enhancedSummary = safeString(enhancedSummary, data.summary);
  } catch (err) {
    console.error('[CV Enhancement] Summary enhancement failed:', err);
    enhancedSummary = data.summary; // Use original on error
  }

  // 2. Enhance experience descriptions
  let enhancedExperiences: ExperienceItem[];
  try {
    enhancedExperiences = enhanceExperience(data.experiences);
    // DEFENSIVE: Fall back to original if enhancement produced empty array
    enhancedExperiences = safeArray(enhancedExperiences, data.experiences);
  } catch (err) {
    console.error('[CV Enhancement] Experience enhancement failed:', err);
    enhancedExperiences = data.experiences;
  }

  // 3. Enhance skills based on role
  let enhancedSkills: SkillItem[];
  try {
    enhancedSkills = enhanceSkills(data.skills, data.preferredRole, data.experiences);
    // DEFENSIVE: Fall back to original if enhancement produced empty array
    enhancedSkills = safeArray(enhancedSkills, data.skills);
  } catch (err) {
    console.error('[CV Enhancement] Skills enhancement failed:', err);
    enhancedSkills = data.skills;
  }

  // 4. Enhance education
  let enhancedEducations: EducationItem[];
  try {
    enhancedEducations = enhanceEducation(data.educations);
    enhancedEducations = safeArray(enhancedEducations, data.educations);
  } catch (err) {
    console.error('[CV Enhancement] Education enhancement failed:', err);
    enhancedEducations = data.educations;
  }

  // 5. Enhance projects
  let enhancedProjects: ProjectItem[];
  try {
    enhancedProjects = enhanceProjects(data.projects);
    enhancedProjects = safeArray(enhancedProjects, data.projects);
  } catch (err) {
    console.error('[CV Enhancement] Projects enhancement failed:', err);
    enhancedProjects = data.projects;
  }

  // 6. Enhance languages
  let enhancedLanguages: LanguageItem[];
  try {
    enhancedLanguages = enhanceLanguages(data.languages);
    enhancedLanguages = safeArray(enhancedLanguages, data.languages);
  } catch (err) {
    console.error('[CV Enhancement] Languages enhancement failed:', err);
    enhancedLanguages = data.languages;
  }

  // 7. Enhance certifications
  let enhancedCertifications: CertificationItem[];
  try {
    enhancedCertifications = enhanceCertifications(data.certifications);
    enhancedCertifications = safeArray(enhancedCertifications, data.certifications);
  } catch (err) {
    console.error('[CV Enhancement] Certifications enhancement failed:', err);
    enhancedCertifications = data.certifications;
  }

  // 8. Normalize city location
  let enhancedCity: string;
  try {
    enhancedCity = normalizeLocation(data.city);
    enhancedCity = safeString(enhancedCity, data.city);
  } catch (err) {
    console.error('[CV Enhancement] City normalization failed:', err);
    enhancedCity = data.city;
  }

  const result: EnhancedCVData = {
    ...data,
    city: enhancedCity,
    summary: enhancedSummary,
    experiences: enhancedExperiences,
    skills: enhancedSkills,
    educations: enhancedEducations,
    projects: enhancedProjects,
    languages: enhancedLanguages,
    certifications: enhancedCertifications,
    _enhanced: true,
    _enhancementTimestamp: new Date().toISOString(),
  };

  // Final validation - log warning if any data was lost
  validateEnhancedData(result, data);

  return result;
}

/**
 * Prepares summary text with contact email for CV display
 * RULE: Email must appear on its own line, placed ABOVE Professional Summary
 * Never injected inside summary text
 *
 * SAFETY: Returns original summary if email is empty, never returns empty string
 */
export function prepareSummaryWithEmail(summary: string, email: string): string {
  // SAFETY: If summary is empty/null, return it as-is (don't add email to nothing)
  if (!summary || summary.trim().length === 0) {
    return summary || '';
  }

  // If no email, return summary unchanged
  if (!email || email.trim().length === 0) {
    return summary;
  }

  // Email on its own line, above the professional summary
  // Double newline ensures clear visual separation
  return `${email.trim()}\n\n${summary}`;
}
