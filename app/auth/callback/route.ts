import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle error from Supabase (e.g., expired or invalid link)
  if (error) {
    const errorMessage = errorDescription || 'confirmation_failed'
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
      return NextResponse.redirect(
        new URL(`/auth/confirm?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      )
    }

    if (data.user) {
      // Update email_verified status in public.users table
      await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('id', data.user.id)

      // Get user role to determine redirect
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = userData?.role || data.user.user_metadata?.role

      // Redirect to confirmation success page with role info
      return NextResponse.redirect(
        new URL(`/auth/confirm?success=true&role=${role || ''}`, requestUrl.origin)
      )
    }
  }

  // No code provided, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
