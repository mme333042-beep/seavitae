import { getSupabaseClient } from '../client'
import type {
  Jobseeker,
  JobseekerInsert,
  JobseekerUpdate,
  CV,
  CVSection,
  CVSectionType,
  CVSectionContent,
  Json,
} from '../types'

// Create a jobseeker profile
export async function createJobseekerProfile(
  userId: string,
  data: Omit<JobseekerInsert, 'user_id'>
): Promise<{ success: boolean; jobseeker?: Jobseeker; error?: string }> {
  const supabase = getSupabaseClient()

  // Validate required fields
  if (!userId) {
    console.error('[Jobseekers] createJobseekerProfile called without userId')
    return { success: false, error: 'User ID is required to create jobseeker profile.' }
  }

  if (!data.full_name) {
    return { success: false, error: 'Full name is required.' }
  }

  // First, ensure the user record exists in public.users
  // This might not exist if the database trigger didn't fire
  const { data: existingUser, error: userCheckError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single()

  if (userCheckError && userCheckError.code !== 'PGRST116') {
    console.error('[Jobseekers] Error checking user record:', userCheckError)
  }

  if (!existingUser) {
    // Try to get the user's email from auth
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser || authUser.id !== userId) {
      console.error('[Jobseekers] Auth user mismatch or not found')
      return { success: false, error: 'User authentication failed. Please try logging in again.' }
    }

    // Create the user record
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: authUser.email!,
        role: 'jobseeker',
        email_verified: !!authUser.email_confirmed_at,
      })

    if (userInsertError) {
      // Check if it's a duplicate error (might have been created by trigger)
      if (userInsertError.code !== '23505') {
        console.error('[Jobseekers] Failed to create user record:', userInsertError)
        return { success: false, error: 'Failed to initialize user account. Please try again.' }
      }
    }
  } else if (existingUser.role !== 'jobseeker') {
    return { success: false, error: 'This account is registered as an employer, not a jobseeker.' }
  }

  // Check if jobseeker profile already exists
  const { data: existingJobseeker } = await supabase
    .from('jobseekers')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existingJobseeker) {
    // Return success with existing profile
    const { data: fullJobseeker } = await supabase
      .from('jobseekers')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { success: true, jobseeker: fullJobseeker || undefined }
  }

  // Create the jobseeker profile
  const { data: jobseeker, error } = await supabase
    .from('jobseekers')
    .insert({
      user_id: userId,
      ...data,
    })
    .select()
    .single()

  if (error) {
    console.error('[Jobseekers] Failed to create jobseeker profile:', error)

    // Provide user-friendly error messages
    let errorMessage = error.message
    if (error.code === '23505') {
      errorMessage = 'A jobseeker profile already exists for this account.'
    } else if (error.code === '23503') {
      errorMessage = 'User account not found. Please ensure you are logged in.'
    } else if (error.code === '42501') {
      errorMessage = 'Permission denied. Please ensure you are logged in.'
    }

    return { success: false, error: errorMessage }
  }

  if (!jobseeker) {
    console.error('[Jobseekers] Insert succeeded but no jobseeker data returned')
    return { success: false, error: 'Failed to create jobseeker profile. Please try again.' }
  }

  // Create a default CV for the jobseeker
  const { error: cvError } = await supabase.from('cvs').insert({
    jobseeker_id: jobseeker.id,
    title: 'My CV',
    is_primary: true,
    is_locked: false,
    version: 1,
  })

  if (cvError) {
    console.error('[Jobseekers] Failed to create default CV:', cvError)
    // Don't fail the whole operation - the CV can be created later
  }

  return { success: true, jobseeker }
}

// Get jobseeker profile for current user
export async function getMyJobseekerProfile(): Promise<Jobseeker | null> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('jobseekers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // PGRST116 = "no rows returned" - expected for new users without a profile
    if (error.code !== 'PGRST116') {
      console.error('Failed to get jobseeker profile:', error)
    }
    return null
  }

  return data
}

// Update jobseeker profile
export async function updateJobseekerProfile(
  jobseekerId: string,
  updates: JobseekerUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('jobseekers')
    .update(updates)
    .eq('id', jobseekerId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Toggle visibility
export async function setVisibility(
  jobseekerId: string,
  isVisible: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('jobseekers')
    .update({ is_visible: isVisible })
    .eq('id', jobseekerId)

  if (error) {
    return { success: false, error: error.message }
  }

  // The database trigger will automatically lock/unlock the CV

  return { success: true }
}

// Get jobseeker's CV with sections
export async function getMyCV(): Promise<{
  cv: CV | null
  sections: CVSection[]
} | null> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // First get the jobseeker ID
  const { data: jobseeker } = await supabase
    .from('jobseekers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!jobseeker) {
    return null
  }

  // Get the primary CV
  const { data: cv } = await supabase
    .from('cvs')
    .select('*')
    .eq('jobseeker_id', jobseeker.id)
    .eq('is_primary', true)
    .single()

  if (!cv) {
    return null
  }

  // Get CV sections
  const { data: sections } = await supabase
    .from('cv_sections')
    .select('*')
    .eq('cv_id', cv.id)
    .order('section_order', { ascending: true })

  return {
    cv,
    sections: sections || [],
  }
}

// Update CV section
export async function updateCVSection(
  cvId: string,
  sectionType: CVSectionType,
  content: CVSectionContent
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  // Check if CV is locked
  const { data: cv, error: cvError } = await supabase
    .from('cvs')
    .select('is_locked')
    .eq('id', cvId)
    .single()

  if (cvError) {
    console.error('[Jobseekers] Failed to check CV lock status:', cvError)
    return { success: false, error: 'Failed to verify CV status. Please try again.' }
  }

  if (cv?.is_locked) {
    return {
      success: false,
      error: 'Your CV is locked while visible to employers. Turn off visibility from your dashboard to edit.',
    }
  }

  // Check if section exists
  const { data: existingSection } = await supabase
    .from('cv_sections')
    .select('id')
    .eq('cv_id', cvId)
    .eq('section_type', sectionType)
    .single()

  if (existingSection) {
    // Update existing section
    const { error } = await supabase
      .from('cv_sections')
      .update({ content: content as Json })
      .eq('id', existingSection.id)

    if (error) {
      console.error('[Jobseekers] Failed to update CV section:', error)
      return { success: false, error: error.message }
    }
  } else {
    // Create new section
    const { error } = await supabase.from('cv_sections').insert({
      cv_id: cvId,
      section_type: sectionType,
      content: content as Json,
    })

    if (error) {
      console.error('[Jobseekers] Failed to create CV section:', error)
      return { success: false, error: error.message }
    }
  }

  // Increment CV version
  const { error: versionError } = await supabase.rpc('increment_cv_version', {
    cv_id_param: cvId,
  })

  if (versionError) {
    console.error('[Jobseekers] Failed to increment CV version:', versionError)
  }

  return { success: true }
}

// Delete CV section
export async function deleteCVSection(
  cvId: string,
  sectionType: CVSectionType
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('cv_sections')
    .delete()
    .eq('cv_id', cvId)
    .eq('section_type', sectionType)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Check if CV is editable (not locked)
export async function isCVEditable(cvId: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { data } = await supabase
    .from('cvs')
    .select('is_locked')
    .eq('id', cvId)
    .single()

  return data ? !data.is_locked : false
}

// Get profile completeness
export async function getProfileCompleteness(jobseekerId: string): Promise<number> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.rpc('calculate_profile_completeness', {
    jobseeker_id_param: jobseekerId,
  })

  if (error) {
    console.error('Failed to calculate profile completeness:', error)
    return 0
  }

  return data || 0
}

// Search visible jobseekers (for employers)
export interface JobseekerSearchFilters {
  keywords?: string
  city?: string
  skills?: string[]
  minYearsExperience?: number
  maxYearsExperience?: number
}

export async function searchJobseekers(
  filters: JobseekerSearchFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<{
  jobseekers: Jobseeker[]
  total: number
  page: number
  pageSize: number
}> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('jobseekers')
    .select('*', { count: 'exact' })
    .eq('is_visible', true)

  // Apply filters
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  if (filters.keywords) {
    query = query.or(
      `full_name.ilike.%${filters.keywords}%,preferred_role.ilike.%${filters.keywords}%,bio.ilike.%${filters.keywords}%`
    )
  }

  if (filters.minYearsExperience !== undefined) {
    query = query.gte('years_experience', filters.minYearsExperience)
  }

  if (filters.maxYearsExperience !== undefined) {
    query = query.lte('years_experience', filters.maxYearsExperience)
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to).order('updated_at', { ascending: false })

  const { data, count, error } = await query

  if (error) {
    console.error('Failed to search jobseekers:', error)
    return { jobseekers: [], total: 0, page, pageSize }
  }

  return {
    jobseekers: data || [],
    total: count || 0,
    page,
    pageSize,
  }
}

// Get a jobseeker by ID (for employers viewing visible profiles)
export async function getJobseekerById(jobseekerId: string): Promise<Jobseeker | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('jobseekers')
    .select('*')
    .eq('id', jobseekerId)
    .single()

  if (error) {
    console.error('Failed to get jobseeker:', error)
    return null
  }

  return data
}

// Get a specific jobseeker's CV (for employers viewing visible profiles)
export async function getJobseekerCV(jobseekerId: string): Promise<{
  jobseeker: Jobseeker
  cv: CV
  sections: CVSection[]
} | null> {
  const supabase = getSupabaseClient()

  // Get jobseeker (RLS will ensure they're visible)
  const { data: jobseeker, error: jobseekerError } = await supabase
    .from('jobseekers')
    .select('*')
    .eq('id', jobseekerId)
    .single()

  if (jobseekerError || !jobseeker) {
    return null
  }

  // Get primary CV
  const { data: cv, error: cvError } = await supabase
    .from('cvs')
    .select('*')
    .eq('jobseeker_id', jobseekerId)
    .eq('is_primary', true)
    .single()

  if (cvError || !cv) {
    return null
  }

  // Get sections
  const { data: sections } = await supabase
    .from('cv_sections')
    .select('*')
    .eq('cv_id', cv.id)
    .order('section_order', { ascending: true })

  return {
    jobseeker,
    cv,
    sections: sections || [],
  }
}
