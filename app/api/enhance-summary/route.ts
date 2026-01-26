import { NextRequest, NextResponse } from 'next/server';
import { enhanceSummaryWithAI, enhanceExperienceWithAI } from '@/lib/gemini';
import { enhanceSummary } from '@/lib/cvEnhancer';

/**
 * POST /api/enhance-summary
 *
 * Enhances CV content using AI (Gemini) with fallback to regex.
 * This runs server-side where the API key is available.
 *
 * Request body:
 * - type: 'summary' | 'experience' (what to enhance)
 * - summary?: string (for summary enhancement)
 * - preferredRole?: string (target job role)
 * - yearsExperience?: number (years of experience)
 * - description?: string (for experience enhancement)
 * - jobTitle?: string (for experience enhancement)
 * - company?: string (for experience enhancement)
 *
 * Response:
 * - enhanced: string (the enhanced content)
 * - method: 'ai' | 'regex' | 'error' (which method was used)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'summary' } = body;

    // Handle experience enhancement
    if (type === 'experience') {
      const { description, jobTitle, company } = body;

      if (!description || typeof description !== 'string') {
        return NextResponse.json(
          { error: 'Description is required for experience enhancement' },
          { status: 400 }
        );
      }

      const aiEnhanced = await enhanceExperienceWithAI(
        description,
        jobTitle || '',
        company || ''
      );

      if (aiEnhanced) {
        return NextResponse.json({
          enhanced: aiEnhanced,
          method: 'ai',
        });
      }

      // AI failed - return original (no regex fallback for experience)
      return NextResponse.json({
        enhanced: description,
        method: 'fallback',
      });
    }

    // Handle summary enhancement (default)
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

    // On any error, return original content
    try {
      const body = await request.clone().json();
      return NextResponse.json({
        enhanced: body.summary || body.description || '',
        method: 'error',
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to enhance content' },
        { status: 500 }
      );
    }
  }
}
