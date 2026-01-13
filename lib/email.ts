// Email notification service for SeaVitae
// This service can be connected to providers like Resend, SendGrid, or Mailgun

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
}

// Get the base URL for email links
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

// Send email using configured provider
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, html, text } = options;

  // Check if email sending is configured
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    // Log in development, but don't fail - just skip sending
    console.log('[Email] Email sending not configured (no RESEND_API_KEY)');
    console.log('[Email] Would send to:', to);
    console.log('[Email] Subject:', subject);
    return { success: true }; // Return success to not block the flow
  }

  try {
    // Using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'SeaVitae <notifications@seavitae.com>',
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Email] Failed to send email:', errorData);
      return { success: false, error: 'Failed to send email' };
    }

    console.log('[Email] Email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return { success: false, error: 'Email service error' };
  }
}

// Email templates

export function getNewMessageEmailTemplate(
  recipientName: string,
  senderName: string,
  messagePreview: string
): { subject: string; html: string } {
  const baseUrl = getBaseUrl();

  return {
    subject: `New message from ${senderName} - SeaVitae`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #31439B; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">SeaVitae</h1>
  </div>

  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #000435; margin-top: 0;">New Message Received</h2>

    <p>Hi ${recipientName},</p>

    <p>You have received a new message from <strong>${senderName}</strong>:</p>

    <div style="background-color: #EFEFEF; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #666666; font-style: italic;">"${messagePreview}${messagePreview.length >= 200 ? '...' : ''}"</p>
    </div>

    <a href="${baseUrl}/messages" style="display: inline-block; background-color: #31439B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px;">View Message</a>

    <p style="color: #888888; font-size: 14px; margin-top: 30px;">
      You're receiving this email because you have an account on SeaVitae.
      <br>To manage your notification preferences, visit your <a href="${baseUrl}/jobseeker/settings" style="color: #31439B;">account settings</a>.
    </p>
  </div>
</body>
</html>
    `.trim(),
  };
}

export function getInterviewRequestEmailTemplate(
  recipientName: string,
  employerName: string,
  interviewType: string,
  proposedDate: string | null,
  message: string | null
): { subject: string; html: string } {
  const baseUrl = getBaseUrl();

  const formattedType = interviewType === 'in_person' ? 'In-Person'
    : interviewType === 'video' ? 'Video Call'
    : interviewType === 'phone' ? 'Phone Call'
    : interviewType;

  const formattedDate = proposedDate
    ? new Date(proposedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'To be determined';

  return {
    subject: `Interview Request from ${employerName} - SeaVitae`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #31439B; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">SeaVitae</h1>
  </div>

  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #000435; margin-top: 0;">New Interview Request!</h2>

    <p>Hi ${recipientName},</p>

    <p>Great news! <strong>${employerName}</strong> would like to schedule an interview with you.</p>

    <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #166534;">
      <h3 style="margin-top: 0; color: #166534;">Interview Details</h3>
      <p style="margin: 5px 0;"><strong>Type:</strong> ${formattedType}</p>
      <p style="margin: 5px 0;"><strong>Proposed Date:</strong> ${formattedDate}</p>
      ${message ? `
      <p style="margin: 15px 0 5px 0;"><strong>Message from employer:</strong></p>
      <p style="margin: 0; color: #666666; font-style: italic;">"${message}"</p>
      ` : ''}
    </div>

    <p>Please respond to this interview request at your earliest convenience.</p>

    <a href="${baseUrl}/jobseeker/interviews" style="display: inline-block; background-color: #31439B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px;">View Interview Request</a>

    <p style="color: #888888; font-size: 14px; margin-top: 30px;">
      You're receiving this email because you have an account on SeaVitae.
      <br>To manage your notification preferences, visit your <a href="${baseUrl}/jobseeker/settings" style="color: #31439B;">account settings</a>.
    </p>
  </div>
</body>
</html>
    `.trim(),
  };
}
