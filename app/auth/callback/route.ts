import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const type = requestUrl.searchParams.get('type')

  // Check if this is a password recovery flow
  const isPasswordRecovery = type === 'recovery'

  // Handle error from Supabase (e.g., expired or invalid link)
  if (error) {
    const errorMessage = errorDescription || 'confirmation_failed'
    // For password recovery errors, redirect to forgot-password page
    if (isPasswordRecovery) {
      return NextResponse.redirect(
        new URL(`/forgot-password?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
      )
    }
    return NextResponse.redirect(
      new URL(`/auth/confirm?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }

  if (code) {
    const cookieStore = await cookies()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        new URL('/auth/confirm?error=configuration_error', requestUrl.origin)
      )
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Cookies can only be modified in a Server Action or Route Handler
          }
        },
      },
    })

    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth Callback] Exchange error:', exchangeError)
      // For password recovery errors, redirect to forgot-password page
      if (isPasswordRecovery) {
        return NextResponse.redirect(
          new URL(`/forgot-password?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }
      return NextResponse.redirect(
        new URL(`/auth/confirm?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      )
    }

    if (data.user) {
      // For password recovery, redirect to reset-password page
      if (isPasswordRecovery) {
        return NextResponse.redirect(
          new URL('/reset-password', requestUrl.origin)
        )
      }

      // Get role from metadata (set during signup)
      const metadataRole = data.user.user_metadata?.role

      // Ensure user record exists with role and email_verified status
      // Use upsert to handle both new records and existing records
      await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          role: metadataRole,
          email_verified: true,
        }, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })

      // Get user role from database (now guaranteed to exist)
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = userData?.role || metadataRole

      // Redirect to confirmation success page with role info
      return NextResponse.redirect(
        new URL(`/auth/confirm?success=true&role=${role || ''}`, requestUrl.origin)
      )
    }
  }

  // No code provided, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
