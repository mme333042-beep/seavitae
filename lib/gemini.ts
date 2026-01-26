/**
 * Google Gemini API Integration for CV Enhancement
 *
 * Uses Gemini to intelligently rewrite CV content.
 * Designed with graceful fallback - returns null on any failure.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const TIMEOUT_MS = 10000; // 10 second timeout

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: {
    message?: string;
    code?: number;
  };
}

/**
 * Call Gemini API with a prompt
 */
async function callGemini(prompt: string, maxTokens: number = 300): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini] No API key configured - using fallback');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Gemini] API error ${response.status}: ${errorText}`);
      return null;
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      console.warn(`[Gemini] API returned error: ${data.error.message}`);
      return null;
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text || text.length < 10) {
      console.warn('[Gemini] Empty or too short response');
      return null;
    }

    return text;

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('[Gemini] Request timed out - using fallback');
      } else {
        console.warn(`[Gemini] Error: ${error.message} - using fallback`);
      }
    }
    return null;
  }
}

/**
 * Post-process AI output to clean it up
 */
function cleanAIOutput(text: string): string {
  return text
    // Remove em dashes and en dashes - replace with commas
    .replace(/\s*[—–]\s*/g, ', ')
    // Fix double commas
    .replace(/,\s*,/g, ',')
    // Fix comma before period
    .replace(/,\s*\./g, '.')
    // Fix double spaces
    .replace(/\s{2,}/g, ' ')
    // Remove AI preamble
    .replace(/^(Here is|Here's|Below is|The enhanced|Enhanced|Summary:?|Output:?)\s*/i, '')
    // Ensure ends with period
    .replace(/([^.!?])$/, '$1.')
    .trim();
}

/**
 * Enhance a professional summary using Gemini AI
 *
 * CV Quality Checks Applied:
 * 1. Spelling and grammar - Fix all errors
 * 2. Typos - Catch typos in words, numbers, extra spaces
 * 3. Word choice - Use action verbs, remove personal pronouns ("I", "my"), cut filler words
 * 4. Length - Keep concise (60-80 words)
 * 5. ATS optimization - Include relevant keywords
 *
 * Returns null on any failure (timeout, rate limit, error) for graceful fallback
 */
export async function enhanceSummaryWithAI(
  summary: string,
  preferredRole: string,
  yearsExperience: number
): Promise<string | null> {
  if (!summary || summary.trim().length < 10) {
    return null; // Nothing meaningful to enhance
  }

  const prompt = `You are a professional CV/resume writer and ATS optimization expert. Enhance this professional summary following these STRICT rules:

## QUALITY CHECKS TO APPLY:

1. **SPELLING & GRAMMAR**: Fix ALL spelling and grammar errors
2. **TYPOS**: Catch and fix typos in words, numbers, and extra spaces
3. **WORD CHOICE**:
   - Use strong ACTION VERBS (achieved, delivered, implemented, led, managed, developed)
   - REMOVE all personal pronouns ("I am", "I have", "my") - use third person or implied first person
   - REMOVE filler words (very, really, actually, basically, just, things)
4. **LENGTH**: Keep it 60-80 words maximum - shorten verbose sentences without losing meaning
5. **ATS KEYWORDS**: Include industry-specific keywords for "${preferredRole || 'the target role'}"

## CRITICAL RULES:

- PRESERVE the jobseeker's key achievements and experience areas
- NO EM DASHES (—) - use commas or "and" instead
- NO FAKE INFO - don't invent metrics or skills not in the original
- Start with their profession (e.g., "Experienced Software Engineer..." or "Detail-oriented Nurse...")
- End with what value they bring
- Sound human and professional, not robotic

## CONTEXT:
- Target Role: ${preferredRole || 'Professional'}
- Experience: ${yearsExperience > 0 ? yearsExperience + ' years' : 'Entry level'}

## ORIGINAL SUMMARY:
${summary}

## OUTPUT (just the enhanced summary, nothing else):`;

  const result = await callGemini(prompt, 200);

  if (!result) return null;

  // Validate result
  if (!/[a-zA-Z]{5,}/.test(result)) {
    console.warn('[Gemini] Response appears invalid');
    return null;
  }

  console.log('[Gemini] Successfully enhanced summary');
  return cleanAIOutput(result);
}

/**
 * Enhance work experience descriptions using Gemini AI
 *
 * CV Quality Checks Applied:
 * 1. Quantify Impact - Add measurable accomplishments where possible
 * 2. Spelling and grammar - Fix all errors
 * 3. Typos - Catch typos
 * 4. Word choice - Use action verbs, remove pronouns
 * 5. Length - Keep each bullet concise
 *
 * Returns null on failure for graceful fallback
 */
export async function enhanceExperienceWithAI(
  description: string,
  jobTitle: string,
  company: string
): Promise<string | null> {
  if (!description || description.trim().length < 10) {
    return null;
  }

  const prompt = `You are a professional CV writer. Enhance this job experience description following these STRICT rules:

## QUALITY CHECKS TO APPLY:

1. **QUANTIFY IMPACT**: Where reasonable, add measurable results (%, numbers, scale)
   - "Managed team" → "Managed team of 5 engineers"
   - "Improved sales" → "Improved sales by 20%"
   - BUT don't invent fake numbers - only quantify if it's reasonable to estimate
2. **SPELLING & GRAMMAR**: Fix ALL errors
3. **TYPOS**: Fix typos in words, numbers, extra spaces
4. **ACTION VERBS**: Start each bullet with strong verbs (Developed, Implemented, Led, Achieved, Delivered, Managed, Coordinated, Designed)
5. **REMOVE PRONOUNS**: No "I", "my", "me" - start directly with verb
6. **CONCISE**: Each bullet should be 1-2 lines max

## FORMAT:
- Return as bullet points (use • character)
- Each bullet on new line
- 3-6 bullets total

## CRITICAL RULES:
- NO FAKE METRICS - only quantify if reasonable
- Keep the original duties/achievements - just enhance wording
- NO EM DASHES (—)

## CONTEXT:
- Job Title: ${jobTitle}
- Company: ${company}

## ORIGINAL DESCRIPTION:
${description}

## OUTPUT (bullet points only, nothing else):`;

  const result = await callGemini(prompt, 400);

  if (!result) return null;

  console.log('[Gemini] Successfully enhanced experience description');
  return cleanAIOutput(result);
}

/**
 * Enhance skills list - normalize and improve presentation
 */
export async function enhanceSkillsWithAI(
  skills: string[],
  preferredRole: string
): Promise<string[] | null> {
  if (!skills || skills.length === 0) {
    return null;
  }

  const prompt = `You are a CV optimization expert. Review and enhance this skills list for a "${preferredRole}" role:

## TASKS:
1. Fix any spelling errors in skill names
2. Standardize capitalization (e.g., "javascript" → "JavaScript", "PYTHON" → "Python")
3. Remove duplicates or near-duplicates
4. Remove overly generic skills that don't add value (e.g., "Microsoft Word", "Typing", "Email")
5. Keep technical and role-specific skills

## ORIGINAL SKILLS:
${skills.join(', ')}

## OUTPUT (comma-separated list of cleaned skills, nothing else):`;

  const result = await callGemini(prompt, 200);

  if (!result) return null;

  const cleanedSkills = result
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 50);

  if (cleanedSkills.length === 0) return null;

  console.log('[Gemini] Successfully enhanced skills');
  return cleanedSkills;
}

/**
 * Check CV completeness and provide feedback
 */
export async function checkCVCompleteness(cvData: {
  summary?: string;
  experience?: { title: string; description: string }[];
  education?: { degree: string }[];
  skills?: string[];
  email?: string;
  phone?: string;
}): Promise<{ score: number; feedback: string[] } | null> {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 100;

  // Check summary (20 points)
  if (cvData.summary && cvData.summary.length > 50) {
    score += 20;
  } else {
    feedback.push("Add a professional summary (at least 50 characters)");
  }

  // Check experience (25 points)
  if (cvData.experience && cvData.experience.length > 0) {
    score += 15;
    const hasDescriptions = cvData.experience.some(e => e.description && e.description.length > 20);
    if (hasDescriptions) {
      score += 10;
    } else {
      feedback.push("Add descriptions to your work experience with specific achievements");
    }
  } else {
    feedback.push("Add at least one work experience entry");
  }

  // Check education (15 points)
  if (cvData.education && cvData.education.length > 0) {
    score += 15;
  } else {
    feedback.push("Add your educational background");
  }

  // Check skills (15 points)
  if (cvData.skills && cvData.skills.length >= 3) {
    score += 15;
  } else {
    feedback.push("Add at least 3 relevant skills");
  }

  // Check contact info (25 points)
  if (cvData.email) {
    score += 15;
  } else {
    feedback.push("Add your email address");
  }

  if (cvData.phone) {
    score += 10;
  } else {
    feedback.push("Add your phone number for better contact options");
  }

  return {
    score: Math.round((score / maxScore) * 100),
    feedback
  };
}

/**
 * Check if Gemini API is configured and likely available
 */
export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
