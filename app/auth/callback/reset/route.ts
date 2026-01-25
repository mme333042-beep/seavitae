import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Dedicated callback route for password reset/recovery
// This route always redirects to /reset-password after exchanging the code
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle error from Supabase (e.g., expired or invalid link)
  if (error) {
    const errorMessage = errorDescription || 'Reset link expired or invalid'
    return NextResponse.redirect(
      new URL(`/forgot-password?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }

  if (code) {
    const cookieStore = await cookies()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        new URL('/forgot-password?error=Configuration error', requestUrl.origin)
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
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth Callback Reset] Exchange error:', exchangeError)
      return NextResponse.redirect(
        new URL(`/forgot-password?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      )
    }

    // Successfully exchanged code - redirect to reset password page
    return NextResponse.redirect(
      new URL('/reset-password', requestUrl.origin)
    )
  }

  // No code provided, redirect to forgot password page
  return NextResponse.redirect(new URL('/forgot-password', requestUrl.origin))
}
