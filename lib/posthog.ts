/**
 * PostHog Analytics Integration for SeaVitae
 *
 * Frontend-only event tracking for understanding user funnels and drop-offs.
 *
 * IMPORTANT:
 * - No PII is tracked
 * - No CV content is tracked
 * - No message content is tracked
 * - All events are safe to disable
 * - Does not affect performance or user experience
 *
 * To disable: Set NEXT_PUBLIC_POSTHOG_ENABLED=false in .env
 * To configure: Set NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST
 */

// PostHog client (lazy-loaded)
let posthogClient: PostHogClient | null = null

// Type for PostHog client (minimal interface)
interface PostHogClient {
  capture: (event: string, properties?: Record<string, unknown>) => void
  identify: (distinctId: string, properties?: Record<string, unknown>) => void
  reset: () => void
}

/**
 * Check if PostHog tracking is enabled
 */
export function isPostHogEnabled(): boolean {
  // Must be explicitly enabled and have a key configured
  return (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_POSTHOG_ENABLED === 'true' &&
    !!process.env.NEXT_PUBLIC_POSTHOG_KEY
  )
}

/**
 * Initialize PostHog client (lazy-loaded)
 * Safe to call multiple times - only initializes once
 */
async function getPostHogClient(): Promise<PostHogClient | null> {
  if (!isPostHogEnabled()) {
    return null
  }

  if (posthogClient) {
    return posthogClient
  }

  try {
    // Dynamic import to avoid loading PostHog if disabled
    const posthog = (await import('posthog-js')).default

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    if (!apiKey) {
      console.warn('[PostHog] API key not configured')
      return null
    }

    posthog.init(apiKey, {
      api_host: apiHost,
      // Privacy-focused settings
      capture_pageview: false, // We'll track page views manually if needed
      capture_pageleave: false,
      autocapture: false, // No auto-capturing - explicit events only
      disable_session_recording: true, // No session recording
      persistence: 'localStorage',
      // Don't track these by default
      property_denylist: ['$ip', '$current_url', '$pathname'],
    })

    posthogClient = posthog
    return posthogClient
  } catch (error) {
    console.error('[PostHog] Failed to initialize:', error)
    return null
  }
}

// ============================================
// FUNNEL EVENT TYPES
// ============================================

/**
 * Jobseeker Funnel Events
 * Track the signup and onboarding flow for jobseekers
 */
export type JobseekerFunnelEvent =
  | 'signup_page_viewed'           // User lands on /jobseeker/signup
  | 'signup_started'               // User starts filling form
  | 'email_submitted'              // User submits signup form
  | 'email_verification_sent'      // Verification email was sent
  | 'email_verified'               // User clicks verification link
  | 'profile_creation_started'     // User lands on profile creation
  | 'cv_saved'                     // User saves their CV
  | 'profile_completed'            // Profile reaches sufficient completeness

/**
 * Employer Funnel Events
 * Track the signup and verification flow for employers
 */
export type EmployerFunnelEvent =
  | 'employer_signup_viewed'       // User lands on /employer
  | 'employer_type_selected'       // User selects company or individual
  | 'employer_form_started'        // User starts filling details
  | 'employer_form_submitted'      // User submits employer details
  | 'employer_email_verified'      // Employer email verified
  | 'company_profile_created'      // Employer profile created in DB
  | 'verification_pending'         // Waiting for admin approval
  | 'verification_approved'        // Admin approved employer

/**
 * Activation / Value Events
 * Track key moments that indicate user value
 */
export type ActivationEvent =
  | 'profile_made_visible'         // Jobseeker makes profile public
  | 'search_performed'             // Employer searches for candidates
  | 'cv_viewed'                    // Employer views a CV
  | 'cv_saved_by_employer'         // Employer saves a CV
  | 'cv_downloaded'                // CV was downloaded/exported
  | 'interview_requested'          // Employer requests interview
  | 'interview_accepted'           // Jobseeker accepts interview
  | 'message_sent'                 // User sends a message

// Combined type for all events
export type FunnelEvent = JobseekerFunnelEvent | EmployerFunnelEvent | ActivationEvent

// ============================================
// TRACKING FUNCTIONS
// ============================================

/**
 * Track a funnel event
 *
 * @param event - The event name
 * @param properties - Optional additional properties (no PII!)
 *
 * Safe to call even if PostHog is disabled - will silently no-op
 */
export async function trackFunnelEvent(
  event: FunnelEvent,
  properties?: {
    role?: 'jobseeker' | 'employer'
    employer_type?: 'company' | 'individual'
    step_number?: number
    success?: boolean
    // Add other non-PII properties as needed
  }
): Promise<void> {
  // Don't track in SSR
  if (typeof window === 'undefined') return

  // Log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[PostHog Event]', event, properties || '')
  }

  try {
    const client = await getPostHogClient()
    if (client) {
      client.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        source: 'web',
      })
    }
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.error('[PostHog] Error tracking event:', error)
  }
}

/**
 * Identify a user (after login/signup)
 * Only call with user ID - no PII
 *
 * @param userId - The user's UUID (not email or name)
 * @param role - User role (jobseeker/employer)
 */
export async function identifyUser(
  userId: string,
  role: 'jobseeker' | 'employer' | 'admin'
): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const client = await getPostHogClient()
    if (client) {
      client.identify(userId, {
        role,
        identified_at: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('[PostHog] Error identifying user:', error)
  }
}

/**
 * Reset user identity (on logout)
 */
export async function resetIdentity(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const client = await getPostHogClient()
    if (client) {
      client.reset()
    }
  } catch (error) {
    console.error('[PostHog] Error resetting identity:', error)
  }
}

// ============================================
// CONVENIENCE FUNCTIONS FOR COMMON EVENTS
// ============================================

/**
 * Track jobseeker signup page view
 * Call this when /jobseeker/signup loads
 */
export function trackJobseekerSignupView(): void {
  trackFunnelEvent('signup_page_viewed', { role: 'jobseeker' })
}

/**
 * Track jobseeker signup form started
 * Call this when user starts filling the form
 */
export function trackJobseekerSignupStarted(): void {
  trackFunnelEvent('signup_started', { role: 'jobseeker' })
}

/**
 * Track jobseeker email submitted
 * Call this when signup form is submitted
 */
export function trackJobseekerEmailSubmitted(): void {
  trackFunnelEvent('email_submitted', { role: 'jobseeker' })
}

/**
 * Track email verification sent
 * Call this after signup returns emailConfirmationRequired
 */
export function trackEmailVerificationSent(role: 'jobseeker' | 'employer'): void {
  trackFunnelEvent('email_verification_sent', { role })
}

/**
 * Track email verified
 * Call this when user completes email verification
 */
export function trackEmailVerified(role: 'jobseeker' | 'employer'): void {
  trackFunnelEvent('email_verified', { role })
}

/**
 * Track profile creation started
 * Call this when user lands on profile creation page
 */
export function trackProfileCreationStarted(): void {
  trackFunnelEvent('profile_creation_started', { role: 'jobseeker' })
}

/**
 * Track CV saved
 * Call this when user saves their CV
 */
export function trackCVSaved(): void {
  trackFunnelEvent('cv_saved', { role: 'jobseeker' })
}

/**
 * Track profile completed
 * Call this when profile reaches completeness threshold
 */
export function trackProfileCompleted(): void {
  trackFunnelEvent('profile_completed', { role: 'jobseeker' })
}

/**
 * Track employer signup page view
 * Call this when /employer loads
 */
export function trackEmployerSignupView(): void {
  trackFunnelEvent('employer_signup_viewed', { role: 'employer' })
}

/**
 * Track employer type selection
 * Call this when user selects company or individual
 */
export function trackEmployerTypeSelected(type: 'company' | 'individual'): void {
  trackFunnelEvent('employer_type_selected', { role: 'employer', employer_type: type })
}

/**
 * Track employer form started
 * Call this when user starts filling employer details
 */
export function trackEmployerFormStarted(type: 'company' | 'individual'): void {
  trackFunnelEvent('employer_form_started', { role: 'employer', employer_type: type })
}

/**
 * Track employer form submitted
 * Call this when employer details form is submitted
 */
export function trackEmployerFormSubmitted(type: 'company' | 'individual'): void {
  trackFunnelEvent('employer_form_submitted', { role: 'employer', employer_type: type })
}

/**
 * Track company profile created
 * Call this when employer profile is created in DB
 */
export function trackCompanyProfileCreated(type: 'company' | 'individual'): void {
  trackFunnelEvent('company_profile_created', { role: 'employer', employer_type: type })
}

/**
 * Track verification pending
 * Call this when employer is waiting for admin approval
 */
export function trackVerificationPending(): void {
  trackFunnelEvent('verification_pending', { role: 'employer' })
}

/**
 * Track profile made visible
 * Call this when jobseeker sets is_visible = true
 */
export function trackProfileMadeVisible(): void {
  trackFunnelEvent('profile_made_visible', { role: 'jobseeker' })
}

/**
 * Track search performed
 * Call this when employer searches for candidates
 */
export function trackSearchPerformed(): void {
  trackFunnelEvent('search_performed', { role: 'employer' })
}

/**
 * Track CV viewed by employer
 * Call this when employer views a jobseeker's CV
 */
export function trackCVViewed(): void {
  trackFunnelEvent('cv_viewed', { role: 'employer' })
}

/**
 * Track CV saved by employer
 * Call this when employer saves a CV
 */
export function trackCVSavedByEmployer(): void {
  trackFunnelEvent('cv_saved_by_employer', { role: 'employer' })
}

/**
 * Track CV downloaded
 * Call this when CV is downloaded/exported
 */
export function trackCVDownloaded(): void {
  trackFunnelEvent('cv_downloaded')
}

/**
 * Track interview requested
 * Call this when employer requests interview
 */
export function trackInterviewRequested(): void {
  trackFunnelEvent('interview_requested', { role: 'employer' })
}

/**
 * Track interview accepted
 * Call this when jobseeker accepts interview
 */
export function trackInterviewAccepted(): void {
  trackFunnelEvent('interview_accepted', { role: 'jobseeker' })
}

/**
 * Track message sent
 * Call this when user sends a message
 */
export function trackMessageSent(role: 'jobseeker' | 'employer'): void {
  trackFunnelEvent('message_sent', { role })
}
