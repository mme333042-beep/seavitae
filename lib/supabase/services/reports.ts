import { getSupabaseClient } from '../client'
import { getCurrentUser } from '../auth'
import type { ReportReason } from '@/lib/reporting'

export type ReportTargetType = 'cv_profile' | 'employer_profile' | 'message'

export interface CreateReportParams {
  targetType: ReportTargetType
  targetId: string
  reason: ReportReason
  note?: string
}

export interface ReportResult {
  success: boolean
  error?: string
  report?: {
    id: string
    target_type: ReportTargetType
    target_id: string
    reason: ReportReason
    note: string | null
    created_at: string
  }
}

// Create a report
export async function createReport(params: CreateReportParams): Promise<ReportResult> {
  const supabase = getSupabaseClient()

  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'You must be logged in to submit a report' }
  }

  const { targetType, targetId, reason, note } = params

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      note: note || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create report:', error)
    return { success: false, error: 'Failed to submit report. Please try again.' }
  }

  return { success: true, report: data }
}

// Get my reports (for user to see their submitted reports)
export async function getMyReports(): Promise<{
  id: string
  target_type: ReportTargetType
  target_id: string
  reason: string
  note: string | null
  status: string
  created_at: string
}[]> {
  const supabase = getSupabaseClient()

  const user = await getCurrentUser()
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get reports:', error)
    return []
  }

  return data || []
}
