import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

// Test endpoint to verify email configuration
// GET /api/test-email?to=your-email@example.com
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientEmail = searchParams.get('to');

    if (!recipientEmail) {
      return NextResponse.json(
        {
          error: 'Missing "to" parameter',
          usage: '/api/test-email?to=your-email@example.com'
        },
        { status: 400 }
      );
    }

    // Check environment variables
    const resendKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    console.log('[Test Email] Environment check:');
    console.log('- RESEND_API_KEY:', resendKey ? `Set (${resendKey.substring(0, 10)}...)` : '❌ NOT SET');
    console.log('- EMAIL_FROM:', emailFrom || 'Not set (using default)');

    if (!resendKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY environment variable is not set',
        emailFrom: emailFrom || 'SeaVitae <notifications@seavitae.com> (default)',
      });
    }

    // Try sending test email
    const result = await sendEmail({
      to: recipientEmail,
      subject: 'SeaVitae Email Test - Configuration Working! ✅',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="background: #31439B; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">SeaVitae</h1>
  </div>
  <div style="border: 1px solid #e5e7eb; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2>✅ Email Configuration Test Successful!</h2>
    <p>Your Resend email integration is working correctly.</p>
    <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0;"><strong>From:</strong> ${emailFrom || 'SeaVitae <notifications@seavitae.com>'}</p>
      <p style="margin: 5px 0 0 0;"><strong>API Key:</strong> ${resendKey.substring(0, 10)}...</p>
    </div>
    <p>All email notifications are ready to send!</p>
  </div>
</body>
</html>
      `,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        sentTo: recipientEmail,
        from: emailFrom || 'SeaVitae <notifications@seavitae.com> (default)',
        apiKeyConfigured: true,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Unknown error',
        sentTo: recipientEmail,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[Test Email] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
