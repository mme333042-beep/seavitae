import { getSupabaseClient } from '../client'
import type {
  Employer,
  EmployerInsert,
  EmployerUpdate,
  SavedCV,
  SavedCVInsert,
  Jobseeker,
  CV,
  CVSection,
  CVSnapshotData,
  Json,
} from '../types'

// Create an employer profile
export async function createEmployerProfile(
  userId: string,
  data: Omit<EmployerInsert, 'user_id'>
): Promise<{ success: boolean; employer?: Employer; error?: string }> {
  const supabase = getSupabaseClient()

  // Validate required fields
  if (!userId) {
    console.error('[Employers] createEmployerProfile called without userId')
    return { success: false, error: 'User ID is required to create employer profile.' }
  }

  if (!data.display_name) {
    return { success: false, error: 'Display name is required.' }
  }

  if (!data.employer_type) {
    return { success: false, error: 'Employer type is required.' }
  }

  // Check if employer profile already exists
  const { data: existingEmployer } = await supabase
    .from('employers')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existingEmployer) {
    // Return success with existing profile info
    const { data: fullEmployer } = await supabase
      .from('employers')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { success: true, employer: fullEmployer || undefined }
  }

  // Create the employer profile
  // New profiles start with pending verification status for admin review
  const { data: employer, error } = await supabase
    .from('employers')
    .insert({
      user_id: userId,
      ...data,
      verification_status: 'pending',
      is_verified: false,
    })
    .select()
    .single()

  if (error) {
    console.error('[Employers] Failed to create employer profile:', error)

    // Provide user-friendly error messages
    let errorMessage = error.message
    if (error.code === '23505') {
      errorMessage = 'An employer profile already exists for this account.'
    } else if (error.code === '23503') {
      errorMessage = 'User account not found. Please ensure you are logged in.'
    } else if (error.code === '42501') {
      errorMessage = 'Permission denied. Please ensure you are logged in.'
    }

    return { success: false, error: errorMessage }
  }

  if (!employer) {
    console.error('[Employers] Insert succeeded but no employer data returned')
    return { success: false, error: 'Failed to create employer profile. Please try again.' }
  }

  return { success: true, employer }
}

// Get employer profile for current user
export async function getMyEmployerProfile(): Promise<Employer | null> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // PGRST116 = "no rows returned" - expected for new employers without a profile
    if (error.code !== 'PGRST116') {
      console.error('Failed to get employer profile:', error)
    }
    return null
  }

  return data
}

// Update employer profile
export async function updateEmployerProfile(
  employerId: string,
  updates: EmployerUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('employers')
    .update(updates)
    .eq('id', employerId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get employer by ID (for jobseekers viewing who contacted them)
export async function getEmployerById(employerId: string): Promise<Employer | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('id', employerId)
    .single()

  if (error) {
    console.error('Failed to get employer:', error)
    return null
  }

  return data
}

// Save a CV snapshot (immutable)
export async function saveCV(
  jobseekerId: string,
  cvId: string
): Promise<{ success: boolean; savedCV?: SavedCV; error?: string }> {
  const supabase = getSupabaseClient()

  // Get current employer
  const employer = await getMyEmployerProfile()
  if (!employer) {
    return { success: false, error: 'Not authenticated as employer' }
  }

  // SECURITY: Only verified employers can save CVs
  if (!employer.is_verified) {
    return { success: false, error: 'Your account must be verified to save CVs' }
  }

  // Get the jobseeker data
  const { data: jobseeker, error: jobseekerError } = await supabase
    .from('jobseekers')
    .select('*')
    .eq('id', jobseekerId)
    .single()

  if (jobseekerError || !jobseeker) {
    return { success: false, error: 'Jobseeker not found' }
  }

  // Get the CV
  const { data: cv, error: cvError } = await supabase
    .from('cvs')
    .select('*')
    .eq('id', cvId)
    .single()

  if (cvError || !cv) {
    return { success: false, error: 'CV not found' }
  }

  // Get CV sections
  const { data: sections } = await supabase
    .from('cv_sections')
    .select('*')
    .eq('cv_id', cvId)
    .order('section_order', { ascending: true })

  // Create snapshot data
  const snapshotData: CVSnapshotData = {
    jobseeker: {
      full_name: jobseeker.full_name,
      preferred_role: jobseeker.preferred_role,
      city: jobseeker.city,
      bio: jobseeker.bio,
      years_experience: jobseeker.years_experience,
    },
    cv: {
      id: cv.id,
      title: cv.title,
      version: cv.version,
    },
    sections: (sections || []).map((s) => ({
      section_type: s.section_type,
      section_order: s.section_order,
      content: s.content,
    })),
    snapshot_timestamp: new Date().toISOString(),
  }

  // Insert saved CV (immutable snapshot)
  const { data: savedCV, error: saveError } = await supabase
    .from('saved_cvs')
    .insert({
      employer_id: employer.id,
      jobseeker_id: jobseekerId,
      cv_id: cvId,
      snapshot_data: snapshotData as unknown as Json,
      snapshot_version: cv.version,
    })
    .select()
    .single()

  if (saveError) {
    // Check if it's a unique constraint violation (already saved this version)
    if (saveError.code === '23505') {
      return { success: false, error: 'You have already saved this CV version' }
    }
    return { success: false, error: saveError.message }
  }

  return { success: true, savedCV }
}

// Get all saved CVs for current employer
export async function getMySavedCVs(): Promise<SavedCV[]> {
  const supabase = getSupabaseClient()

  const employer = await getMyEmployerProfile()
  if (!employer) {
    return []
  }

  const { data, error } = await supabase
    .from('saved_cvs')
    .select('*')
    .eq('employer_id', employer.id)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('Failed to get saved CVs:', error)
    return []
  }

  return data || []
}

// Get saved CV with expanded snapshot data
export async function getSavedCVById(
  savedCVId: string
): Promise<SavedCV | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('saved_cvs')
    .select('*')
    .eq('id', savedCVId)
    .single()

  if (error) {
    console.error('Failed to get saved CV:', error)
    return null
  }

  return data
}

// Delete a saved CV
export async function deleteSavedCV(
  savedCVId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('saved_cvs')
    .delete()
    .eq('id', savedCVId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Check if a CV is already saved by current employer
export async function isCVSaved(
  cvId: string
): Promise<{ saved: boolean; savedCVId?: string }> {
  const supabase = getSupabaseClient()

  const employer = await getMyEmployerProfile()
  if (!employer) {
    return { saved: false }
  }

  const { data } = await supabase
    .from('saved_cvs')
    .select('id')
    .eq('employer_id', employer.id)
    .eq('cv_id', cvId)
    .limit(1)
    .single()

  if (data) {
    return { saved: true, savedCVId: data.id }
  }

  return { saved: false }
}

// Add notes to a saved CV (employers only update notes, not snapshot)
export async function updateSavedCVNotes(
  savedCVId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  // Note: saved_cvs has no UPDATE policy in RLS because snapshots are immutable
  // To add notes, we need to use the admin client or create a specific RLS policy
  // For now, notes should be set at creation time or stored separately

  // This is a design decision - if notes need to be editable, we can:
  // 1. Add a separate employer_cv_notes table
  // 2. Add a specific RLS policy for notes-only updates
  // 3. Use the admin client server-side

  return {
    success: false,
    error: 'Notes cannot be updated after saving (snapshot immutability)'
  }
}

// Get employers who saved a jobseeker's CV (for jobseeker view)
export async function getWhoSavedMyCV(): Promise<
  { employer: Employer; savedAt: string }[]
> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get jobseeker ID
  const { data: jobseeker } = await supabase
    .from('jobseekers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!jobseeker) {
    return []
  }

  // Get saved CVs for this jobseeker
  const { data: savedCVs, error } = await supabase
    .from('saved_cvs')
    .select('employer_id, saved_at')
    .eq('jobseeker_id', jobseeker.id)
    .order('saved_at', { ascending: false })

  if (error || !savedCVs || savedCVs.length === 0) {
    return []
  }

  // Get employer details
  const employerIds = [...new Set(savedCVs.map((s) => s.employer_id))]
  const { data: employers } = await supabase
    .from('employers')
    .select('*')
    .in('id', employerIds)

  if (!employers) {
    return []
  }

  // Map saved CVs to employers
  return savedCVs.map((savedCV) => ({
    employer: employers.find((e) => e.id === savedCV.employer_id)!,
    savedAt: savedCV.saved_at,
  })).filter((item) => item.employer)
}
