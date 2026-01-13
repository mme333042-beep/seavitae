import { getSupabaseClient } from '../client'
import type { Invite, InviteInsert, UserRole } from '../types'

// Generate a unique invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed similar-looking characters
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create an invite code
export async function createInvite(
  email?: string,
  role?: UserRole,
  expiresInDays: number = 7
): Promise<{ success: boolean; invite?: Invite; error?: string }> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Calculate expiry date
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const code = generateInviteCode()

  const { data: invite, error } = await supabase
    .from('invites')
    .insert({
      code,
      created_by: user?.id || null,
      email,
      role,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    // If code collision, try again with a new code
    if (error.code === '23505') {
      return createInvite(email, role, expiresInDays)
    }
    return { success: false, error: error.message }
  }

  return { success: true, invite }
}

// Validate an invite code
export async function validateInviteCode(
  code: string
): Promise<{
  valid: boolean
  invite?: Invite
  error?: string
}> {
  const supabase = getSupabaseClient()

  const { data: invite, error } = await supabase
    .from('invites')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !invite) {
    return { valid: false, error: 'Invalid invite code' }
  }

  if (invite.is_used) {
    return { valid: false, error: 'This invite code has already been used' }
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { valid: false, error: 'This invite code has expired' }
  }

  return { valid: true, invite }
}

// Use an invite code (mark as used)
export async function useInviteCode(
  code: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  // First validate
  const validation = await validateInviteCode(code)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Mark as used (this should be done via admin client for security)
  // In a real implementation, this would be a server-side API call
  const { error } = await supabase
    .from('invites')
    .update({
      is_used: true,
      used_by: userId,
      used_at: new Date().toISOString(),
    })
    .eq('code', code.toUpperCase())

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get my created invites
export async function getMyInvites(): Promise<Invite[]> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get invites:', error)
    return []
  }

  return data || []
}

// Get invite by code (for landing page to show invite details)
export async function getInviteByCode(
  code: string
): Promise<Invite | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error) {
    return null
  }

  return data
}

// Delete an unused invite
export async function deleteInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  // Check if invite is unused before deleting
  const { data: invite } = await supabase
    .from('invites')
    .select('is_used, created_by')
    .eq('id', inviteId)
    .single()

  if (invite?.is_used) {
    return { success: false, error: 'Cannot delete a used invite' }
  }

  const { error } = await supabase
    .from('invites')
    .delete()
    .eq('id', inviteId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Check if invite-only mode is active (from soft launch config)
export function isInviteOnlyMode(): boolean {
  // This could be fetched from a config table or environment variable
  // For soft launch, we default to invite-only
  return true
}
