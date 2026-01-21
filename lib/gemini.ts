/**
 * Google Gemini API Integration for CV Enhancement
 *
 * Uses Gemini to intelligently rewrite CV content.
 * Designed with graceful fallback - returns null on any failure.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const TIMEOUT_MS = 8000; // 8 second timeout - don't make users wait too long

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
 * Enhance a professional summary using Gemini AI
 * Returns null on any failure (timeout, rate limit, error) for graceful fallback
 */
export async function enhanceSummaryWithAI(
  summary: string,
  preferredRole: string,
  yearsExperience: number
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini] No API key configured - using fallback');
    return null;
  }

  if (!summary || summary.trim().length < 10) {
    return null; // Nothing meaningful to enhance
  }

  const prompt = `You are a professional CV/resume writer specializing in ATS optimization. Your job is to enhance this professional summary while keeping the jobseeker's original message and intent intact.

CRITICAL RULES - MUST FOLLOW:
1. PRESERVE THE JOBSEEKER'S STORY: Keep all the information they want to convey. Don't remove their key points.
2. FIT THE TARGET ROLE: Align the summary with the "${preferredRole || 'Professional'}" role they're targeting.
3. ATS OPTIMIZATION: Include industry-specific keywords relevant to "${preferredRole || 'their field'}".
4. HUMAN WRITING STYLE: Write naturally like a real person, not robotic or AI-generated.
5. NO EM DASHES: Never use "—" (em dash). Use commas, periods, or "and" instead.
6. NO FAKE INFO: Don't invent metrics, achievements, or skills not mentioned in the original.
7. CONCISE: Keep it 60-80 words maximum.

FORMATTING RULES:
- Start with their profession/role (e.g., "Experienced Product Manager..." or "Detail-oriented Software Engineer...")
- Remove "I am" statements - use third person or implied first person
- Use simple punctuation (commas, periods) - NO em dashes or semicolons
- End with what value they bring or what they're seeking

WRITING STYLE:
- Sound professional but warm and human
- Avoid buzzwords like "synergy", "leverage", "spearheaded" unless natural
- Use active voice
- Be specific, not generic

CONTEXT:
- Target Role: ${preferredRole || 'Professional'}
- Years of Experience: ${yearsExperience > 0 ? yearsExperience + ' years' : 'Entry level/Not specified'}

ORIGINAL SUMMARY (enhance this while keeping their message):
${summary}

OUTPUT (just the enhanced summary, nothing else):`;

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
          maxOutputTokens: 200,
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
      return null; // Graceful fallback
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      console.warn(`[Gemini] API returned error: ${data.error.message}`);
      return null;
    }

    let enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!enhancedText || enhancedText.length < 20) {
      console.warn('[Gemini] Empty or too short response');
      return null;
    }

    // Basic validation - make sure it's not gibberish
    if (!/[a-zA-Z]{5,}/.test(enhancedText)) {
      console.warn('[Gemini] Response appears invalid');
      return null;
    }

    // POST-PROCESSING: Clean up the output
    // 1. Remove em dashes (—) and en dashes (–) - replace with commas or "and"
    enhancedText = enhancedText
      .replace(/\s*[—–]\s*/g, ', ') // Replace dashes with comma
      .replace(/,\s*,/g, ',') // Fix double commas
      .replace(/,\s*\./g, '.') // Fix comma before period
      .replace(/\s{2,}/g, ' ') // Fix double spaces
      .trim();

    // 2. Remove any AI preamble that might have slipped through
    enhancedText = enhancedText
      .replace(/^(Here is|Here's|Below is|The enhanced|Enhanced summary:?|Summary:?)\s*/i, '')
      .trim();

    // 3. Ensure it ends with a period
    if (enhancedText && !enhancedText.endsWith('.') && !enhancedText.endsWith('!')) {
      enhancedText += '.';
    }

    console.log('[Gemini] Successfully enhanced summary');
    return enhancedText;

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('[Gemini] Request timed out - using fallback');
      } else {
        console.warn(`[Gemini] Error: ${error.message} - using fallback`);
      }
    }
    return null; // Graceful fallback
  }
}

/**
 * Check if Gemini API is configured and likely available
 */
export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
