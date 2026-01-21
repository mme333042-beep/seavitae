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

  const prompt = `You are a professional CV writer. Rewrite this professional summary to be more polished, professional, and ATS-friendly.

RULES:
- Keep it concise (60-80 words max)
- Use third person or remove "I" statements
- Start with the person's role/profession
- Highlight key skills and experience
- Make it grammatically perfect
- Do NOT add fake information or metrics
- Preserve the original meaning and facts
- Do NOT include any preamble like "Here is..." - just output the summary directly

CONTEXT:
- Target Role: ${preferredRole || 'Professional'}
- Years of Experience: ${yearsExperience || 'Not specified'}

ORIGINAL SUMMARY:
${summary}

REWRITTEN SUMMARY:`;

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

    const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!enhancedText || enhancedText.length < 20) {
      console.warn('[Gemini] Empty or too short response');
      return null;
    }

    // Basic validation - make sure it's not gibberish
    if (!/[a-zA-Z]{5,}/.test(enhancedText)) {
      console.warn('[Gemini] Response appears invalid');
      return null;
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
