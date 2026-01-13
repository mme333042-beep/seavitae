import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Validate server-side environment variables
function validateServerEnvVars(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const missing: string[] = []
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    const errorMessage = `[Server] Missing required Supabase environment variables: ${missing.join(', ')}`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  return { url, anonKey }
}

// Server-side client with user context (uses cookies for auth)
export async function createServerClient(): Promise<SupabaseClient> {
  const { url, anonKey } = validateServerEnvVars()
  const cookieStore = await cookies()

  return createSSRServerClient(url, anonKey, {
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
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  })
}

// Admin client with service role - ONLY use server-side
// This bypasses RLS and has full database access
// NEVER expose this to the client or import in client components
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    const missing: string[] = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')

    const errorMessage = `[Server] Missing Supabase admin credentials: ${missing.join(', ')}. ` +
      'The SUPABASE_SERVICE_ROLE_KEY should only be set on the server.'
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Get current user from server context
export async function getUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

// Get current user with role from database
export async function getUserWithRole() {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    return null
  }

  return {
    ...user,
    role: userData.role as 'jobseeker' | 'employer',
    dbUser: userData,
  }
}
