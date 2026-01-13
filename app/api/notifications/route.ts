import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerClient } from '@/lib/supabase/server';
import {
  sendEmail,
  getNewMessageEmailTemplate,
  getInterviewRequestEmailTemplate,
} from '@/lib/email';

// Verify the caller is the actual sender (authentication)
async function verifyCallerIsSender(senderId: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Verify the authenticated user is the same as the sender
    return user.id === senderId;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, recipientId, senderId, data } = body;

    if (!type || !recipientId || !senderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // SECURITY: Verify the caller is authenticated and is the sender
    const isAuthorized = await verifyCallerIsSender(senderId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use admin client to get user emails (bypasses RLS)
    const supabase = createAdminClient();

    // Get recipient's email
    const { data: recipientAuth, error: recipientError } = await supabase.auth.admin.getUserById(recipientId);
    if (recipientError || !recipientAuth.user?.email) {
      console.error('[Notifications] Failed to get recipient:', recipientError);
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Get sender's info
    const { data: senderAuth, error: senderError } = await supabase.auth.admin.getUserById(senderId);
    if (senderError || !senderAuth.user) {
      console.error('[Notifications] Failed to get sender:', senderError);
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      );
    }

    // Get recipient name (from jobseeker or employer profile)
    let recipientName = 'User';
    const { data: jobseekerProfile } = await supabase
      .from('jobseekers')
      .select('full_name')
      .eq('user_id', recipientId)
      .single();

    if (jobseekerProfile) {
      recipientName = jobseekerProfile.full_name;
    } else {
      const { data: employerProfile } = await supabase
        .from('employers')
        .select('display_name')
        .eq('user_id', recipientId)
        .single();

      if (employerProfile) {
        recipientName = employerProfile.display_name;
      }
    }

    // Get sender name
    let senderName = 'A user';
    const { data: senderJobseeker } = await supabase
      .from('jobseekers')
      .select('full_name')
      .eq('user_id', senderId)
      .single();

    if (senderJobseeker) {
      senderName = senderJobseeker.full_name;
    } else {
      const { data: senderEmployer } = await supabase
        .from('employers')
        .select('display_name, company_name, employer_type')
        .eq('user_id', senderId)
        .single();

      if (senderEmployer) {
        senderName = senderEmployer.employer_type === 'company' && senderEmployer.company_name
          ? senderEmployer.company_name
          : senderEmployer.display_name;
      }
    }

    // Send appropriate email based on notification type
    let emailResult;

    switch (type) {
      case 'new_message': {
        const messagePreview = data?.content?.substring(0, 200) || '';
        const template = getNewMessageEmailTemplate(recipientName, senderName, messagePreview);
        emailResult = await sendEmail({
          to: recipientAuth.user.email,
          subject: template.subject,
          html: template.html,
        });
        break;
      }

      case 'interview_request': {
        const template = getInterviewRequestEmailTemplate(
          recipientName,
          senderName,
          data?.interviewType || 'interview',
          data?.proposedDate || null,
          data?.message || null
        );
        emailResult = await sendEmail({
          to: recipientAuth.user.email,
          subject: template.subject,
          html: template.html,
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    if (!emailResult.success) {
      console.error('[Notifications] Email send failed:', emailResult.error);
      // Don't return error - notification sending shouldn't block main flow
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
