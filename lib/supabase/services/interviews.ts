import { getSupabaseClient } from '../client'
import type {
  Interview,
  InterviewInsert,
  InterviewUpdate,
  InterviewStatus,
  InterviewType,
  Employer,
  Jobseeker,
} from '../types'
import { getMyEmployerProfile } from './employers'
import { getMyJobseekerProfile } from './jobseekers'

// Create an interview request (employer only)
export async function createInterviewRequest(
  jobseekerId: string,
  data: {
    proposedDate?: string
    proposedLocation?: string
    interviewType?: InterviewType
    message?: string
  }
): Promise<{ success: boolean; interview?: Interview; error?: string }> {
  const supabase = getSupabaseClient()

  const employer = await getMyEmployerProfile()
  if (!employer) {
    return { success: false, error: 'Not authenticated as employer' }
  }

  // SECURITY: Only verified employers can request interviews
  if (!employer.is_verified) {
    return { success: false, error: 'Your account must be verified to request interviews' }
  }

  const { data: interview, error } = await supabase
    .from('interviews')
    .insert({
      employer_id: employer.id,
      jobseeker_id: jobseekerId,
      proposed_date: data.proposedDate,
      proposed_location: data.proposedLocation,
      interview_type: data.interviewType,
      message: data.message,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, interview }
}

// Get interviews for current employer
export async function getMyInterviewsAsEmployer(): Promise<
  (Interview & { jobseeker?: Jobseeker })[]
> {
  const supabase = getSupabaseClient()

  const employer = await getMyEmployerProfile()
  if (!employer) {
    return []
  }

  const { data: interviews, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('employer_id', employer.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get interviews:', error)
    return []
  }

  // Get jobseeker details
  const jobseekerIds = [...new Set((interviews || []).map((i) => i.jobseeker_id))]

  if (jobseekerIds.length === 0) {
    return interviews || []
  }

  const { data: jobseekers } = await supabase
    .from('jobseekers')
    .select('*')
    .in('id', jobseekerIds)

  return (interviews || []).map((interview) => ({
    ...interview,
    jobseeker: (jobseekers || []).find((j) => j.id === interview.jobseeker_id),
  }))
}

// Get interviews for current jobseeker
export async function getMyInterviewsAsJobseeker(): Promise<
  (Interview & { employer?: Employer })[]
> {
  const supabase = getSupabaseClient()

  const jobseeker = await getMyJobseekerProfile()
  if (!jobseeker) {
    return []
  }

  const { data: interviews, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('jobseeker_id', jobseeker.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get interviews:', error)
    return []
  }

  // Get employer details
  const employerIds = [...new Set((interviews || []).map((i) => i.employer_id))]

  if (employerIds.length === 0) {
    return interviews || []
  }

  const { data: employers } = await supabase
    .from('employers')
    .select('*')
    .in('id', employerIds)

  return (interviews || []).map((interview) => ({
    ...interview,
    employer: (employers || []).find((e) => e.id === interview.employer_id),
  }))
}

// Respond to an interview (jobseeker only)
export async function respondToInterview(
  interviewId: string,
  status: 'accepted' | 'declined',
  responseMessage?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('interviews')
    .update({
      status,
      response_message: responseMessage,
      responded_at: new Date().toISOString(),
    })
    .eq('id', interviewId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Cancel an interview (employer only)
export async function cancelInterview(
  interviewId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('interviews')
    .update({ status: 'cancelled' })
    .eq('id', interviewId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Mark interview as completed (both parties can do this)
export async function markInterviewCompleted(
  interviewId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('interviews')
    .update({ status: 'completed' })
    .eq('id', interviewId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get a specific interview by ID
export async function getInterviewById(
  interviewId: string
): Promise<Interview | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', interviewId)
    .single()

  if (error) {
    console.error('Failed to get interview:', error)
    return null
  }

  return data
}

// Update interview details (employer only)
export async function updateInterview(
  interviewId: string,
  updates: {
    proposedDate?: string
    proposedLocation?: string
    interviewType?: InterviewType
    message?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('interviews')
    .update({
      proposed_date: updates.proposedDate,
      proposed_location: updates.proposedLocation,
      interview_type: updates.interviewType,
      message: updates.message,
    })
    .eq('id', interviewId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Delete an interview request (employer only)
export async function deleteInterview(
  interviewId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('interviews')
    .delete()
    .eq('id', interviewId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get pending interview count for jobseeker
export async function getPendingInterviewCount(): Promise<number> {
  const supabase = getSupabaseClient()

  const jobseeker = await getMyJobseekerProfile()
  if (!jobseeker) {
    return 0
  }

  const { count, error } = await supabase
    .from('interviews')
    .select('*', { count: 'exact', head: true })
    .eq('jobseeker_id', jobseeker.id)
    .eq('status', 'pending')

  if (error) {
    console.error('Failed to get pending interview count:', error)
    return 0
  }

  return count || 0
}

// Check if employer has already sent an interview request to this jobseeker
export async function hasExistingInterviewRequest(
  jobseekerId: string
): Promise<{ exists: boolean; interview?: Interview }> {
  const supabase = getSupabaseClient()

  const employer = await getMyEmployerProfile()
  if (!employer) {
    return { exists: false }
  }

  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('employer_id', employer.id)
    .eq('jobseeker_id', jobseekerId)
    .in('status', ['pending', 'accepted'])
    .limit(1)
    .single()

  if (error || !data) {
    return { exists: false }
  }

  return { exists: true, interview: data }
}
