/**
 * Admin Analytics Functions
 *
 * Read-only analytics data fetching from Supabase.
 * All functions require admin authentication.
 * Fails gracefully if metrics are unavailable.
 */

import { getSupabaseClient } from './client'
import { getAdminUser } from './admin'

export interface PlatformStats {
  totalUsers: number
  jobseekers: number
  employers: number
  cvsCreated: number
  cvsVisible: number
  interviewsRequested: number
  messagesSent: number
  // Invites stats
  invitesCreated: number
  invitesUsed: number
}

export interface UserGrowthData {
  date: string
  jobseekers: number
  employers: number
}

export interface VerificationFunnel {
  pendingEmployers: number
  approvedEmployers: number
  rejectedEmployers: number
  avgApprovalTimeHours: number | null
}

/**
 * Get overall platform statistics
 * Admin-only, read-only
 */
export async function getPlatformStats(): Promise<PlatformStats | null> {
  const supabase = getSupabaseClient()

  // Verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[AdminAnalytics] Unauthorized access attempt to getPlatformStats')
    return null
  }

  try {
    // Fetch all counts in parallel for efficiency
    const [
      usersResult,
      jobseekersResult,
      employersResult,
      cvsResult,
      visibleCvsResult,
      interviewsResult,
      messagesResult,
      invitesResult,
      usedInvitesResult,
    ] = await Promise.all([
      // Total users (excluding admin)
      supabase.from('users').select('id', { count: 'exact', head: true }).neq('role', 'admin'),
      // Jobseekers count
      supabase.from('jobseekers').select('id', { count: 'exact', head: true }),
      // Employers count
      supabase.from('employers').select('id', { count: 'exact', head: true }),
      // CVs created
      supabase.from('cvs').select('id', { count: 'exact', head: true }),
      // CVs visible (published)
      supabase.from('jobseekers').select('id', { count: 'exact', head: true }).eq('is_visible', true),
      // Interviews requested
      supabase.from('interviews').select('id', { count: 'exact', head: true }),
      // Messages sent
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      // Invites created
      supabase.from('invites').select('id', { count: 'exact', head: true }),
      // Invites used
      supabase.from('invites').select('id', { count: 'exact', head: true }).eq('is_used', true),
    ])

    return {
      totalUsers: usersResult.count ?? 0,
      jobseekers: jobseekersResult.count ?? 0,
      employers: employersResult.count ?? 0,
      cvsCreated: cvsResult.count ?? 0,
      cvsVisible: visibleCvsResult.count ?? 0,
      interviewsRequested: interviewsResult.count ?? 0,
      messagesSent: messagesResult.count ?? 0,
      invitesCreated: invitesResult.count ?? 0,
      invitesUsed: usedInvitesResult.count ?? 0,
    }
  } catch (error) {
    console.error('[AdminAnalytics] Error fetching platform stats:', error)
    return null
  }
}

/**
 * Get verification funnel metrics for employers
 * Admin-only, read-only
 */
export async function getVerificationFunnel(): Promise<VerificationFunnel | null> {
  const supabase = getSupabaseClient()

  // Verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[AdminAnalytics] Unauthorized access attempt to getVerificationFunnel')
    return null
  }

  try {
    const [pendingResult, approvedResult, rejectedResult, approvedWithDatesResult] = await Promise.all([
      supabase.from('employers').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabase.from('employers').select('id', { count: 'exact', head: true }).eq('verification_status', 'approved'),
      supabase.from('employers').select('id', { count: 'exact', head: true }).eq('verification_status', 'rejected'),
      // Get approved employers with timestamps to calculate avg approval time
      supabase
        .from('employers')
        .select('created_at, verification_date')
        .eq('verification_status', 'approved')
        .not('verification_date', 'is', null),
    ])

    // Calculate average approval time
    let avgApprovalTimeHours: number | null = null
    if (approvedWithDatesResult.data && approvedWithDatesResult.data.length > 0) {
      const totalHours = approvedWithDatesResult.data.reduce((sum, emp) => {
        if (emp.verification_date && emp.created_at) {
          const created = new Date(emp.created_at).getTime()
          const verified = new Date(emp.verification_date).getTime()
          const hours = (verified - created) / (1000 * 60 * 60)
          return sum + hours
        }
        return sum
      }, 0)
      avgApprovalTimeHours = Math.round(totalHours / approvedWithDatesResult.data.length)
    }

    return {
      pendingEmployers: pendingResult.count ?? 0,
      approvedEmployers: approvedResult.count ?? 0,
      rejectedEmployers: rejectedResult.count ?? 0,
      avgApprovalTimeHours,
    }
  } catch (error) {
    console.error('[AdminAnalytics] Error fetching verification funnel:', error)
    return null
  }
}

/**
 * Get interview statistics
 * Admin-only, read-only
 */
export async function getInterviewStats(): Promise<{
  pending: number
  accepted: number
  declined: number
  completed: number
  total: number
} | null> {
  const supabase = getSupabaseClient()

  // Verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[AdminAnalytics] Unauthorized access attempt to getInterviewStats')
    return null
  }

  try {
    const { data, error } = await supabase.from('interviews').select('status')

    if (error || !data) {
      console.error('[AdminAnalytics] Error fetching interview stats:', error)
      return null
    }

    return {
      pending: data.filter(i => i.status === 'pending').length,
      accepted: data.filter(i => i.status === 'accepted').length,
      declined: data.filter(i => i.status === 'declined').length,
      completed: data.filter(i => i.status === 'completed').length,
      total: data.length,
    }
  } catch (error) {
    console.error('[AdminAnalytics] Error fetching interview stats:', error)
    return null
  }
}

/**
 * Get recent activity summary
 * Admin-only, read-only
 */
export async function getRecentActivity(): Promise<{
  newUsersToday: number
  newUsersThisWeek: number
  newCVsToday: number
  newCVsThisWeek: number
  newInterviewsToday: number
  newInterviewsThisWeek: number
} | null> {
  const supabase = getSupabaseClient()

  // Verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[AdminAnalytics] Unauthorized access attempt to getRecentActivity')
    return null
  }

  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      usersTodayResult,
      usersWeekResult,
      cvsTodayResult,
      cvsWeekResult,
      interviewsTodayResult,
      interviewsWeekResult,
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', todayStart).neq('role', 'admin'),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo).neq('role', 'admin'),
      supabase.from('cvs').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('cvs').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('interviews').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('interviews').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    ])

    return {
      newUsersToday: usersTodayResult.count ?? 0,
      newUsersThisWeek: usersWeekResult.count ?? 0,
      newCVsToday: cvsTodayResult.count ?? 0,
      newCVsThisWeek: cvsWeekResult.count ?? 0,
      newInterviewsToday: interviewsTodayResult.count ?? 0,
      newInterviewsThisWeek: interviewsWeekResult.count ?? 0,
    }
  } catch (error) {
    console.error('[AdminAnalytics] Error fetching recent activity:', error)
    return null
  }
}

/**
 * Get saved CVs statistics (employer engagement)
 * Admin-only, read-only
 */
export async function getSavedCVsStats(): Promise<{
  totalSaved: number
  uniqueEmployersSaving: number
  uniqueJobseekersSaved: number
} | null> {
  const supabase = getSupabaseClient()

  // Verify admin access
  const admin = await getAdminUser()
  if (!admin) {
    console.error('[AdminAnalytics] Unauthorized access attempt to getSavedCVsStats')
    return null
  }

  try {
    const { data, error, count } = await supabase
      .from('saved_cvs')
      .select('employer_id, jobseeker_id', { count: 'exact' })

    if (error) {
      console.error('[AdminAnalytics] Error fetching saved CVs stats:', error)
      return null
    }

    const uniqueEmployers = new Set(data?.map(s => s.employer_id) ?? [])
    const uniqueJobseekers = new Set(data?.map(s => s.jobseeker_id) ?? [])

    return {
      totalSaved: count ?? 0,
      uniqueEmployersSaving: uniqueEmployers.size,
      uniqueJobseekersSaved: uniqueJobseekers.size,
    }
  } catch (error) {
    console.error('[AdminAnalytics] Error fetching saved CVs stats:', error)
    return null
  }
}
