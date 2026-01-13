/**
 * SeaVitae Email Service
 * Email sending functionality using Nodemailer
 */

import nodemailer, { Transporter } from "nodemailer";
import { config } from "../config";

let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): Transporter {
  if (!transporter) {
    if (config.isDevelopment && !config.email.user) {
      // Use console logging in development if no SMTP configured
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
      });
    } else {
      transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    }
  }
  return transporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = getTransporter();

  const mailOptions = {
    from: config.email.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ""),
  };

  if (config.isDevelopment && !config.email.user) {
    // Log email in development
    console.log("=".repeat(50));
    console.log("EMAIL SENT (Development Mode)");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("Body:", options.text || options.html);
    console.log("=".repeat(50));
    return;
  }

  await transport.sendMail(mailOptions);
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${config.frontendUrl}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your SeaVitae account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000435;">Welcome to SeaVitae</h1>
        <p>Thank you for signing up. Please verify your email address to access your account.</p>
        <p>
          <a href="${verifyUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #31439B; color: white; text-decoration: none; border-radius: 6px;">
            Verify Email Address
          </a>
        </p>
        <p style="color: #666;">Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">SeaVitae - A sea of careers, searchable.</p>
      </div>
    `,
  });
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your SeaVitae password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000435;">Password Reset Request</h1>
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <p>
          <a href="${resetUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #31439B; color: white; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666;">Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">SeaVitae - A sea of careers, searchable.</p>
      </div>
    `,
  });
}

/**
 * Send notification of new message (to jobseeker)
 */
export async function sendNewMessageNotification(
  email: string,
  senderName: string
): Promise<void> {
  const messagesUrl = `${config.frontendUrl}/messages`;

  await sendEmail({
    to: email,
    subject: `New message from ${senderName} on SeaVitae`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000435;">You have a new message</h1>
        <p><strong>${senderName}</strong> has sent you a message on SeaVitae.</p>
        <p>
          <a href="${messagesUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #31439B; color: white; text-decoration: none; border-radius: 6px;">
            View Message
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">SeaVitae - A sea of careers, searchable.</p>
      </div>
    `,
  });
}
