import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendEmail, getEmployerApprovedEmailTemplate, getEmployerRejectedEmailTemplate } from '@/lib/email'

// Helper to create Supabase client for API routes
async function createApiSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// Verify admin access
async function verifyAdminAccess(supabase: Awaited<ReturnType<typeof createApiSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { authorized: false, error: 'Not authenticated' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    return { authorized: false, error: 'Admin access required' }
  }

  return { authorized: true, userId: user.id }
}

// POST /api/admin/verify - Approve or reject employer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiSupabaseClient()

    // Verify admin access
    const adminCheck = await verifyAdminAccess(supabase)
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { employerId, action, reason } = body

    if (!employerId) {
      return NextResponse.json(
        { success: false, error: 'Employer ID is required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject', 'reset'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve, reject, or reset' },
        { status: 400 }
      )
    }

    if (action === 'reject' && (!reason || reason.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    let updateData: Record<string, unknown>

    switch (action) {
      case 'approve':
        updateData = {
          verification_status: 'approved',
          is_verified: true,
          verification_date: new Date().toISOString(),
          verification_notes: `Approved by admin on ${new Date().toLocaleDateString()}`,
        }
        break
      case 'reject':
        updateData = {
          verification_status: 'rejected',
          is_verified: false,
          verification_date: new Date().toISOString(),
          verification_notes: reason,
        }
        break
      case 'reset':
        updateData = {
          verification_status: 'pending',
          is_verified: false,
          verification_date: null,
          verification_notes: null,
        }
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { error } = await supabase
      .from('employers')
      .update(updateData)
      .eq('id', employerId)

    if (error) {
      console.error('[API Admin] Error updating employer:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update employer verification status' },
        { status: 500 }
      )
    }

    // Send email notification for approval or rejection
    if (action === 'approve' || action === 'reject') {
      console.log('[API Admin] Starting email notification process for action:', action)
      try {
        // Fetch employer details and user email
        console.log('[API Admin] Fetching employer details for ID:', employerId)
        const { data: employer, error: employerError } = await supabase
          .from('employers')
          .select('user_id, company_name, type')
          .eq('id', employerId)
          .single()

        if (employerError) {
          console.error('[API Admin] Error fetching employer:', employerError)
        }

        console.log('[API Admin] Employer data:', employer)

        if (employer) {
          console.log('[API Admin] Fetching user email for user_id:', employer.user_id)
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', employer.user_id)
            .single()

          if (userError) {
            console.error('[API Admin] Error fetching user:', userError)
          }

          console.log('[API Admin] User data:', { email: user?.email })

          if (user?.email) {
            const employerName = employer.company_name || 'there'
            console.log('[API Admin] Sending email to:', user.email)

            if (action === 'approve') {
              const emailTemplate = getEmployerApprovedEmailTemplate(
                employerName,
                employer.type as 'individual' | 'company'
              )
              const emailResult = await sendEmail({
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
              })
              console.log('[API Admin] Email send result:', emailResult)
              if (emailResult.success) {
                console.log('[API Admin] ✅ Approval email sent successfully to:', user.email)
              } else {
                console.error('[API Admin] ❌ Approval email failed:', emailResult.error)
              }
            } else if (action === 'reject') {
              const emailTemplate = getEmployerRejectedEmailTemplate(
                employerName,
                reason
              )
              const emailResult = await sendEmail({
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
              })
              console.log('[API Admin] Email send result:', emailResult)
              if (emailResult.success) {
                console.log('[API Admin] ✅ Rejection email sent successfully to:', user.email)
              } else {
                console.error('[API Admin] ❌ Rejection email failed:', emailResult.error)
              }
            }
          } else {
            console.error('[API Admin] ❌ No email found for user')
          }
        } else {
          console.error('[API Admin] ❌ No employer data found')
        }
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('[API Admin] ❌ Exception sending notification email:', emailError)
        console.error('[API Admin] Error stack:', emailError instanceof Error ? emailError.stack : 'No stack trace')
      }
    }

    return NextResponse.json({ success: true, action })
  } catch (error) {
    console.error('[API Admin] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// GET /api/admin/verify - Get employers for verification
export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiSupabaseClient()

    // Verify admin access
    const adminCheck = await verifyAdminAccess(supabase)
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const id = searchParams.get('id')

    // Get single employer by ID
    if (id) {
      const { data: employer, error } = await supabase
        .from('employers')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !employer) {
        return NextResponse.json(
          { success: false, error: 'Employer not found' },
          { status: 404 }
        )
      }

      // Get user email
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', employer.user_id)
        .single()

      return NextResponse.json({
        success: true,
        employer: { ...employer, email: user?.email },
      })
    }

    // Get employers by status or all
    let query = supabase.from('employers').select('*')

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('verification_status', status)
    }

    const { data: employers, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[API Admin] Error fetching employers:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch employer data' },
        { status: 500 }
      )
    }

    // Get user emails
    const userIds = employers?.map(e => e.user_id) || []
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds)

    const employersWithEmails = employers?.map(employer => ({
      ...employer,
      email: users?.find(u => u.id === employer.user_id)?.email,
    }))

    // Get stats
    const { data: allEmployers } = await supabase
      .from('employers')
      .select('verification_status')

    const stats = {
      pending: allEmployers?.filter(e => e.verification_status === 'pending').length || 0,
      approved: allEmployers?.filter(e => e.verification_status === 'approved').length || 0,
      rejected: allEmployers?.filter(e => e.verification_status === 'rejected').length || 0,
      total: allEmployers?.length || 0,
    }

    return NextResponse.json({
      success: true,
      employers: employersWithEmails,
      stats,
    })
  } catch (error) {
    console.error('[API Admin] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
