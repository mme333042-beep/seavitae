import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

// Validate environment variables and provide helpful error messages
function validateEnvVars(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const missing: string[] = []
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    const errorMessage = `Missing required Supabase environment variables: ${missing.join(', ')}. ` +
      'Please check your .env.local file and ensure these variables are set.'

    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Supabase] Configuration Error:', errorMessage)
      console.error('[Supabase] Required environment variables:')
      console.error('  - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL')
      console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key')
    }

    throw new Error(errorMessage)
  }

  return { url, anonKey }
}

// Client-side Supabase client using anon key
// Safe to use in browser - RLS policies protect data
export function createClient(): SupabaseClient {
  const { url, anonKey } = validateEnvVars()
  return createBrowserClient(url, anonKey)
}

// Singleton instance for client-side usage
let clientInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient()
  }
  return clientInstance
}
