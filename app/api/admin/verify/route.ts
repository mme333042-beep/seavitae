import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
