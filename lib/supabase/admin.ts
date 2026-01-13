import { getSupabaseClient } from './client'
import type { Employer, VerificationStatus } from './types'

// Check if current user is an admin
export async function isAdmin(): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Check user role in database (primary source of truth)
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return userData?.role === 'admin'
}

// Get current admin user with verification
export async function getAdminUser() {
  const supabase = getSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Verify admin role in database
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    return null
  }

  return {
    user,
    userData,
  }
}

// Get all employers pending verification
export async function getPendingEmployers(): Promise<Employer[]> {
  const supabase = getSupabaseClient()

  // First verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[Admin] Unauthorized access attempt to getPendingEmployers')
    return []
  }

  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[Admin] Error fetching pending employers:', error)
    return []
  }

  return data || []
}

// Get all employers by verification status
export async function getEmployersByStatus(status: VerificationStatus): Promise<Employer[]> {
  const supabase = getSupabaseClient()

  // First verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[Admin] Unauthorized access attempt to getEmployersByStatus')
    return []
  }

  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('verification_status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Admin] Error fetching employers by status:', error)
    return []
  }

  return data || []
}

// Get all employers with their user emails
export async function getAllEmployersWithEmails(): Promise<(Employer & { email?: string })[]> {
  const supabase = getSupabaseClient()

  // First verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[Admin] Unauthorized access attempt to getAllEmployersWithEmails')
    return []
  }

  // Get all employers
  const { data: employers, error } = await supabase
    .from('employers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !employers) {
    console.error('[Admin] Error fetching employers:', error)
    return []
  }

  // Get user emails for these employers
  const userIds = employers.map(e => e.user_id)
  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .in('id', userIds)

  // Combine employer data with emails
  return employers.map(employer => ({
    ...employer,
    email: users?.find(u => u.id === employer.user_id)?.email,
  }))
}

// Get single employer details for verification review
export async function getEmployerForReview(employerId: string): Promise<(Employer & { email?: string }) | null> {
  const supabase = getSupabaseClient()

  // First verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[Admin] Unauthorized access attempt to getEmployerForReview')
    return null
  }

  const { data: employer, error } = await supabase
    .from('employers')
    .select('*')
    .eq('id', employerId)
    .single()

  if (error || !employer) {
    console.error('[Admin] Error fetching employer for review:', error)
    return null
  }

  // Get user email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', employer.user_id)
    .single()

  return {
    ...employer,
    email: user?.email,
  }
}

// Approve employer verification
export async function approveEmployer(
  employerId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  // First verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    return { success: false, error: 'Unauthorized: Admin access required' }
  }

  const { error } = await supabase
    .from('employers')
    .update({
      verification_status: 'approved',
      is_verified: true,
      verification_date: new Date().toISOString(),
      verification_notes: notes || `Approved by admin on ${new Date().toLocaleDateString()}`,
    })
    .eq('id', employerId)

  if (error) {
    console.error('[Admin] Error approving employer:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Reject employer verification
export async function rejectEmployer(
  employerId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  // First verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    return { success: false, error: 'Unauthorized: Admin access required' }
  }

  if (!reason || reason.trim().length === 0) {
    return { success: false, error: 'Rejection reason is required' }
  }

  const { error } = await supabase
    .from('employers')
    .update({
      verification_status: 'rejected',
      is_verified: false,
      verification_date: new Date().toISOString(),
      verification_notes: reason,
    })
    .eq('id', employerId)

  if (error) {
    console.error('[Admin] Error rejecting employer:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Reset employer verification status back to pending
export async function resetEmployerVerification(
  employerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  // First verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    return { success: false, error: 'Unauthorized: Admin access required' }
  }

  const { error } = await supabase
    .from('employers')
    .update({
      verification_status: 'pending',
      is_verified: false,
      verification_date: null,
      verification_notes: null,
    })
    .eq('id', employerId)

  if (error) {
    console.error('[Admin] Error resetting employer verification:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get verification statistics
export async function getVerificationStats(): Promise<{
  pending: number
  approved: number
  rejected: number
  total: number
} | null> {
  const supabase = getSupabaseClient()

  // First verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[Admin] Unauthorized access attempt to getVerificationStats')
    return null
  }

  const { data, error } = await supabase
    .from('employers')
    .select('verification_status')

  if (error || !data) {
    console.error('[Admin] Error fetching verification stats:', error)
    return null
  }

  return {
    pending: data.filter(e => e.verification_status === 'pending').length,
    approved: data.filter(e => e.verification_status === 'approved').length,
    rejected: data.filter(e => e.verification_status === 'rejected').length,
    total: data.length,
  }
}
