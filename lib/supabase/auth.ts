import { getSupabaseClient } from './client'
import type { UserRole, EmployerType } from './types'

// Password validation rules (same as existing)
export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters.')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter.')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter.')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number.')
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least 1 special character.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Sign up a new user
export interface SignUpData {
  email: string
  password: string
  role: UserRole
  // For jobseekers
  fullName?: string
  // For employers
  employerType?: EmployerType
  displayName?: string
}

export interface AuthResult {
  success: boolean
  error?: string
  userId?: string
  emailConfirmationRequired?: boolean
  email?: string // Email for resend flow
}

// Resend confirmation email (link-based)
export async function resendConfirmationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    // Handle rate limiting gracefully
    let errorMessage = error.message
    if (error.message.toLowerCase().includes('rate') || error.message.toLowerCase().includes('too many')) {
      errorMessage = 'Please wait a moment before requesting another email.'
    } else if (error.message.toLowerCase().includes('already confirmed')) {
      errorMessage = 'This email is already confirmed. Please log in.'
    }
    return { success: false, error: errorMessage }
  }

  return { success: true }
}


export async function signUp(data: SignUpData): Promise<AuthResult> {
  const supabase = getSupabaseClient()

  // Validate password
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    return {
      success: false,
      error: passwordValidation.errors.join(' '),
    }
  }

  // Sign up with Supabase Auth
  // Include role and employerType in user metadata for use after email confirmation
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        role: data.role,
        employerType: data.employerType || null,
        displayName: data.displayName || null,
        fullName: data.fullName || null,
      },
    },
  })

  if (authError) {
    console.error('[Auth] Signup error:', authError)

    // Provide user-friendly error messages
    let errorMessage = authError.message
    if (authError.message.toLowerCase().includes('already registered')) {
      errorMessage = 'This email is already registered. Please login instead.'
    } else if (authError.message.toLowerCase().includes('invalid email')) {
      errorMessage = 'Please enter a valid email address.'
    } else if (authError.message.toLowerCase().includes('weak password')) {
      errorMessage = 'Password is too weak. Please choose a stronger password.'
    }

    return {
      success: false,
      error: errorMessage,
    }
  }

  if (!authData.user) {
    console.error('[Auth] Signup returned no user')
    return {
      success: false,
      error: 'Failed to create user account. Please try again.',
    }
  }

  // Check if email confirmation is required
  // If session is null but user exists, email confirmation is pending
  const emailConfirmationRequired = !authData.session && authData.user.identities?.length === 0 === false

  // Create user record in public.users table
  // Note: A database trigger also creates this record, so duplicates are expected
  // This is a backup in case the trigger doesn't fire
  try {
    await supabase.from('users').insert({
      id: authData.user.id,
      email: data.email,
      role: data.role,
      email_verified: !!authData.session, // True if auto-confirmed
    })
  } catch {
    // Expected - user record may already exist from database trigger
  }

  return {
    success: true,
    userId: authData.user.id,
    emailConfirmationRequired,
    email: data.email, // Return email for OTP verification flow
  }
}

// Sign in an existing user
export interface SignInData {
  email: string
  password: string
}

export interface SignInResult {
  success: boolean
  error?: string
  userId?: string
  role?: UserRole
  redirectPath?: string
  emailNotConfirmed?: boolean
  email?: string
}

export async function signIn(data: SignInData): Promise<SignInResult> {
  const supabase = getSupabaseClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (authError) {
    // Handle email not confirmed gracefully (not as an error)
    if (authError.message.toLowerCase().includes('email not confirmed')) {
      return {
        success: false,
        emailNotConfirmed: true,
        email: data.email,
        error: 'Please verify your email to continue. Check your inbox for the confirmation link.',
      }
    }

    // Provide user-friendly error messages for actual errors
    let errorMessage = authError.message
    if (authError.message.toLowerCase().includes('invalid login credentials')) {
      errorMessage = 'Invalid email or password. Please try again.'
    } else if (authError.message.toLowerCase().includes('too many requests')) {
      errorMessage = 'Too many login attempts. Please try again later.'
    }

    return {
      success: false,
      error: errorMessage,
    }
  }

  if (!authData.user) {
    return {
      success: false,
      error: 'Failed to sign in. Please try again.',
    }
  }

  // Get user role from database using SECURITY DEFINER function
  // This bypasses RLS to avoid circular dependency with admin role checks
  const { data: userData, error: userError } = await supabase
    .rpc('get_user_role', { user_id: authData.user.id })
    .single()

  let role: UserRole | undefined

  if (userData && typeof userData === 'object' && 'role' in userData) {
    // Database is the ONLY source of truth for roles
    role = (userData as { role: string }).role as UserRole
  } else if (userError?.code === 'PGRST116') {
    // No database record exists - this is a first login after email confirmation
    // Use metadata ONLY for initial record creation (not for admin - admins are promoted in DB)
    const metadataRole = authData.user.user_metadata?.role as UserRole | undefined
    if (metadataRole && metadataRole !== 'admin') {
      role = metadataRole
      // Create the user record
      try {
        await supabase.from('users').upsert({
          id: authData.user.id,
          email: authData.user.email!,
          role: metadataRole,
          email_verified: true,
        })
      } catch {
        // Expected for race conditions with database trigger
      }
    }
  }

  if (!role) {
    return {
      success: false,
      error: 'Unable to determine your account type. Please contact support.',
    }
  }

  // Update last login timestamp silently
  try {
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id)
  } catch {
    // Silently handle any errors
  }

  const employerType = authData.user.user_metadata?.employerType as EmployerType | undefined

  return await determineRedirectPath(supabase, authData.user.id, role, employerType)
}

// Helper function to determine redirect path after login
async function determineRedirectPath(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  role: UserRole,
  employerType?: EmployerType
): Promise<SignInResult> {
  let redirectPath = '/'

  if (role === 'admin') {
    // Admin users go directly to admin dashboard
    redirectPath = '/admin'
  } else if (role === 'jobseeker') {
    // Check if jobseeker has a profile
    const { data: jobseekerData } = await supabase
      .from('jobseekers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (jobseekerData) {
      redirectPath = '/jobseeker/dashboard'
    } else {
      redirectPath = '/jobseeker/create-profile'
    }
  } else if (role === 'employer') {
    // Check if employer has a profile
    const { data: employerData } = await supabase
      .from('employers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (employerData) {
      redirectPath = '/employer/dashboard'
    } else {
      // Route to onboarding based on metadata or default
      if (employerType === 'company') {
        redirectPath = '/employer/company/details'
      } else if (employerType === 'individual') {
        redirectPath = '/employer/individual/details'
      } else {
        redirectPath = '/employer'
      }
    }
  }

  return {
    success: true,
    userId,
    role,
    redirectPath,
  }
}

// Sign out the current user
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[Auth] Sign out error:', error)
      return {
        success: false,
        error: 'Failed to sign out. Please try again.',
      }
    }

    // Clear all cached session data from browser storage
    if (typeof window !== 'undefined') {
      // Clear sessionStorage items
      sessionStorage.removeItem('seavitae_session')
      sessionStorage.removeItem('seavitae_cv_state')
      sessionStorage.removeItem('seavitae_saved_cvs')

      // Clear any localStorage auth-related items
      localStorage.removeItem('seavitae_last_activity')

      // Clear all Supabase-related items from localStorage
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }

    return { success: true }
  } catch (err) {
    console.error('[Auth] Unexpected sign out error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred during sign out.',
    }
  }
}

// Get current session
export async function getSession() {
  const supabase = getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Get current user
export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Get current user with profile data
export async function getCurrentUserWithProfile() {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user record
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData) {
    return null
  }

  const role = userData.role as UserRole

  // Get profile based on role
  if (role === 'jobseeker') {
    const { data: jobseekerData } = await supabase
      .from('jobseekers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return {
      user,
      userData,
      role,
      profile: jobseekerData,
    }
  } else if (role === 'employer') {
    const { data: employerData } = await supabase
      .from('employers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return {
      user,
      userData,
      role,
      profile: employerData,
    }
  }

  return {
    user,
    userData,
    role,
    profile: null,
  }
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  const supabase = getSupabaseClient()
  return supabase.auth.onAuthStateChange(callback)
}

// Check if user is logged in (client-side)
export async function isLoggedIn(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

// Get dashboard path for a role
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'jobseeker':
      return '/jobseeker/dashboard'
    case 'employer':
      return '/employer/dashboard'
    default:
      return '/'
  }
}
