import { NextRequest, NextResponse } from 'next/server';
import { enhanceSummaryWithAI } from '@/lib/gemini';
import { enhanceSummary } from '@/lib/cvEnhancer';

/**
 * POST /api/enhance-summary
 *
 * Enhances a professional summary using AI (Gemini) with fallback to regex.
 * This runs server-side where the API key is available.
 *
 * Request body:
 * - summary: string (the original summary)
 * - preferredRole: string (target job role)
 * - yearsExperience: number (years of experience)
 *
 * Response:
 * - enhanced: string (the enhanced summary)
 * - method: 'ai' | 'regex' (which method was used)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summary, preferredRole, yearsExperience } = body;

    if (!summary || typeof summary !== 'string') {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      );
    }

    // Try AI enhancement first
    const aiEnhanced = await enhanceSummaryWithAI(
      summary,
      preferredRole || '',
      yearsExperience || 0
    );

    if (aiEnhanced) {
      // AI succeeded
      return NextResponse.json({
        enhanced: aiEnhanced,
        method: 'ai',
      });
    }

    // AI failed - fall back to regex enhancement
    console.log('[enhance-summary] AI unavailable, using regex fallback');
    const regexEnhanced = enhanceSummary(
      summary,
      preferredRole || '',
      yearsExperience || 0
    );

    return NextResponse.json({
      enhanced: regexEnhanced,
      method: 'regex',
    });

  } catch (error) {
    console.error('[enhance-summary] Error:', error);

    // On any error, return original summary
    try {
      const body = await request.clone().json();
      return NextResponse.json({
        enhanced: body.summary || '',
        method: 'error',
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to enhance summary' },
        { status: 500 }
      );
    }
  }
}
