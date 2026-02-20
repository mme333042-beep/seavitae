import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Check if this is a password recovery flow
  const isPasswordRecovery = type === 'recovery'

  // Handle error from Supabase (e.g., expired or invalid link)
  if (error) {
    const errorMessage = errorDescription || 'confirmation_failed'
    if (isPasswordRecovery) {
      return NextResponse.redirect(
        new URL(`/forgot-password?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
      )
    }
    return NextResponse.redirect(
      new URL(`/auth/confirm?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }

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

  let verifiedUser = null

  // 1. Try token_hash + type flow first (cross-device safe — works when email is
  //    opened in a different browser or device than where signup happened)
  if (token_hash && type) {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'recovery' | 'email' | 'invite' | 'magiclink' | 'email_change',
      token_hash,
    })

    if (verifyError) {
      console.error('[Auth Callback] OTP verify error:', verifyError)
      if (isPasswordRecovery) {
        return NextResponse.redirect(
          new URL(`/forgot-password?error=${encodeURIComponent(verifyError.message)}`, requestUrl.origin)
        )
      }
      return NextResponse.redirect(
        new URL(`/auth/confirm?error=${encodeURIComponent(verifyError.message)}`, requestUrl.origin)
      )
    }

    if (data.user) {
      if (isPasswordRecovery) {
        return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
      }
      verifiedUser = data.user
    }
  }

  // 2. Fall back to PKCE code flow (same-browser verification)
  if (!verifiedUser && code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth Callback] Exchange error:', exchangeError)
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
      if (isPasswordRecovery) {
        return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
      }
      verifiedUser = data.user
    }
  }

  // Handle successfully verified user
  if (verifiedUser) {
    const metadataRole = verifiedUser.user_metadata?.role

    // Ensure user record exists with role and email_verified status
    await supabase
      .from('users')
      .upsert({
        id: verifiedUser.id,
        email: verifiedUser.email,
        role: metadataRole,
        email_verified: true,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', verifiedUser.id)
      .single()

    const role = userData?.role || metadataRole

    return NextResponse.redirect(
      new URL(`/auth/confirm?success=true&role=${role || ''}`, requestUrl.origin)
    )
  }

  // No code or token_hash provided, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
