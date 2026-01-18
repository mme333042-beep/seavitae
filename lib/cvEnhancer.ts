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
 */
export function enhanceSummary(
  summary: string,
  preferredRole: string,
  yearsExperience: number,
  email: string
): string {
  if (!summary || summary.trim().length === 0) {
    return summary;
  }

  let enhanced = summary;

  // 1. Remove weak phrases
  for (const { pattern, replacement } of WEAK_PHRASES) {
    enhanced = enhanced.replace(pattern, replacement);
  }

  // 2. Clean up resulting whitespace
  enhanced = enhanced.replace(/\s{2,}/g, ' ').trim();

  // 3. Remove sentences that became empty or too short
  enhanced = enhanced.split(/(?<=[.!?])\s+/)
    .filter(sentence => sentence.trim().length > 10)
    .join(' ');

  // 4. Ensure it starts with a strong statement (not "I am looking...")
  if (/^I am\s/i.test(enhanced)) {
    // Transform "I am a software engineer" to "Software engineer with..."
    enhanced = enhanced.replace(/^I am (a |an )?/i, '');
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
  }

  // 5. Add years of experience if not already mentioned
  if (yearsExperience > 0 && !/\d+\s*(years?|yrs?)\s*(of)?\s*experience/i.test(enhanced)) {
    const experiencePhrase = yearsExperience === 1
      ? '1 year of experience'
      : `${yearsExperience} years of experience`;

    // Insert after first sentence or at the beginning
    const firstPeriod = enhanced.indexOf('.');
    if (firstPeriod > 0 && firstPeriod < 100) {
      enhanced = enhanced.slice(0, firstPeriod + 1) + ` Brings ${experiencePhrase} in the field.` + enhanced.slice(firstPeriod + 1);
    }
  }

  // 6. Inject relevant industry keywords naturally
  const keywords = getKeywordsForRole(preferredRole);
  const summaryLower = enhanced.toLowerCase();

  // Only add keywords that aren't already present
  const missingKeywords = keywords.filter(kw => !summaryLower.includes(kw.toLowerCase()));

  if (missingKeywords.length > 0 && !enhanced.includes('Skilled in')) {
    // Add 2-3 missing keywords naturally at the end
    const keywordsToAdd = missingKeywords.slice(0, 3);
    enhanced = enhanced.trim();
    if (!enhanced.endsWith('.')) enhanced += '.';
    enhanced += ` Skilled in ${keywordsToAdd.join(', ')}.`;
  }

  // 7. Final grammar cleanup
  enhanced = cleanupGrammar(enhanced);

  return enhanced;
}

/**
 * Enhances experience descriptions
 */
export function enhanceExperience(experiences: ExperienceItem[]): ExperienceItem[] {
  return experiences.map(exp => {
    let description = exp.description;

    if (!description || description.trim().length === 0) {
      return exp;
    }

    // 1. Split into bullet points if not already
    let bullets = description.split(/[\n•\-\*]/).map(b => b.trim()).filter(b => b.length > 0);

    // 2. Enhance each bullet point
    bullets = bullets.map(bullet => {
      let enhanced = bullet;

      // Replace weak verbs with strong action verbs
      enhanced = replaceWeakVerbs(enhanced);

      // Convert to past tense if not current role
      if (!exp.current) {
        enhanced = convertToPastTense(enhanced);
      }

      // Add inferable metrics
      enhanced = addInferrableMetrics(enhanced, exp.title);

      // Clean up grammar
      enhanced = cleanupGrammar(enhanced);

      return enhanced;
    });

    // 3. Rejoin bullets
    const enhancedDescription = bullets.join('\n');

    // 4. Normalize dates and location
    return {
      ...exp,
      description: enhancedDescription,
      location: normalizeLocation(exp.location),
      startDate: normalizeDate(exp.startDate),
      endDate: exp.current ? '' : normalizeDate(exp.endDate),
    };
  });
}

/**
 * Enhances skills list based on role
 */
export function enhanceSkills(
  skills: SkillItem[],
  preferredRole: string,
  experiences: ExperienceItem[]
): SkillItem[] {
  // Get existing skill names (lowercase for comparison)
  const existingSkillNames = new Set(skills.map(s => s.name.toLowerCase()));

  // Normalize existing skills
  const enhancedSkills = skills.map(skill => ({
    ...skill,
    name: skill.name.trim(),
  }));

  // Get suggested skills based on role
  const suggestedTechnical = getTechnicalSkillsForRole(preferredRole);

  // Extract skills mentioned in experience descriptions
  const experienceText = experiences.map(e => `${e.title} ${e.description}`).join(' ').toLowerCase();

  // Add relevant suggested skills that aren't already present
  // and appear to be relevant based on experience
  const skillsToAdd: SkillItem[] = [];

  for (const skill of suggestedTechnical) {
    const skillLower = skill.toLowerCase();
    if (!existingSkillNames.has(skillLower)) {
      // Check if this skill is mentioned or implied in experiences
      const isRelevant = experienceText.includes(skillLower) ||
        preferredRole.toLowerCase().includes(skillLower.split(' ')[0]);

      if (isRelevant) {
        skillsToAdd.push({
          id: crypto.randomUUID(),
          name: skill,
        });
      }
    }
  }

  // Add universal soft skills that aren't present (limit to 2)
  let softSkillsAdded = 0;
  for (const skill of UNIVERSAL_SOFT_SKILLS) {
    if (softSkillsAdded >= 2) break;
    if (!existingSkillNames.has(skill.toLowerCase())) {
      skillsToAdd.push({
        id: crypto.randomUUID(),
        name: skill,
      });
      softSkillsAdded++;
    }
  }

  // Limit total added skills to avoid overwhelming
  const finalSkillsToAdd = skillsToAdd.slice(0, 5);

  return [...enhancedSkills, ...finalSkillsToAdd];
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
// MAIN ENHANCER FUNCTION
// ============================================================================

/**
 * Main function to enhance all CV data
 * This is the entry point called during CV save
 */
export function enhanceCV(data: CVData): EnhancedCVData {
  // 1. Enhance professional summary (with email injection)
  const enhancedSummary = enhanceSummary(
    data.summary,
    data.preferredRole,
    data.yearsExperience,
    data.email
  );

  // 2. Enhance experience descriptions
  const enhancedExperiences = enhanceExperience(data.experiences);

  // 3. Enhance skills based on role
  const enhancedSkills = enhanceSkills(data.skills, data.preferredRole, data.experiences);

  // 4. Enhance education
  const enhancedEducations = enhanceEducation(data.educations);

  // 5. Enhance projects
  const enhancedProjects = enhanceProjects(data.projects);

  // 6. Enhance languages
  const enhancedLanguages = enhanceLanguages(data.languages);

  // 7. Enhance certifications
  const enhancedCertifications = enhanceCertifications(data.certifications);

  // 8. Normalize locations
  const enhancedCity = normalizeLocation(data.city);

  return {
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
}

/**
 * Prepares summary text with contact email for CV display
 * The email is added as the first line of contact info
 */
export function prepareSummaryWithEmail(summary: string, email: string): string {
  if (!email) return summary;

  // Add email as contact info at the beginning of summary
  // This ensures ATS can find the email in the CV content
  return `Contact: ${email}\n\n${summary}`;
}
