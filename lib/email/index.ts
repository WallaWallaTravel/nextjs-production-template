/**
 * Email Service
 *
 * Provides email functionality using Resend.
 * Falls back gracefully when Resend is not configured.
 */

import { Resend } from 'resend';

import { logger } from '@/lib/logger';

// ============================================================================
// Types
// ============================================================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================================================
// Client
// ============================================================================

let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (resend) return resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn('RESEND_API_KEY not configured - emails will not be sent');
    return null;
  }

  resend = new Resend(apiKey);
  return resend;
}

// ============================================================================
// Email Functions
// ============================================================================

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@example.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'My App';

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const client = getResendClient();

  if (!client) {
    logger.warn('Email not sent - Resend not configured', { to: options.to });
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    // Build email payload - Resend requires html or react
    const emailPayload = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      ...(options.html && { html: options.html }),
      ...(options.text && { text: options.text }),
      ...(options.replyTo && { replyTo: options.replyTo }),
      ...(options.cc && { cc: Array.isArray(options.cc) ? options.cc : [options.cc] }),
      ...(options.bcc && { bcc: Array.isArray(options.bcc) ? options.bcc : [options.bcc] }),
    };

    const { data, error } = await client.emails.send(emailPayload as Parameters<typeof client.emails.send>[0]);

    if (error) {
      logger.error('Failed to send email', { error: error.message, to: options.to });
      return { success: false, error: error.message };
    }

    logger.info('Email sent successfully', { messageId: data?.id, to: options.to });
    return { success: true, messageId: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Email sending error', { error: message, to: options.to });
    return { success: false, error: message };
  }
}

// ============================================================================
// Template Helpers
// ============================================================================

/**
 * Create a simple HTML email
 */
export function createSimpleEmail(options: {
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const { title, body, ctaText, ctaUrl } = options;

  const ctaButton = ctaText && ctaUrl
    ? `<a href="${ctaUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">${ctaText}</a>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f9fafb; border-radius: 8px; padding: 32px;">
    <h1 style="color: #111827; margin-top: 0;">${title}</h1>
    <div style="color: #4b5563;">${body}</div>
    ${ctaButton}
  </div>
  <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
    <p>This email was sent by ${FROM_NAME}</p>
  </div>
</body>
</html>
  `.trim();
}

// ============================================================================
// Common Email Templates
// ============================================================================

export const emailTemplates = {
  /**
   * Welcome email for new users
   */
  welcome: (name: string) => ({
    subject: `Welcome to ${FROM_NAME}!`,
    html: createSimpleEmail({
      title: `Welcome, ${name}!`,
      body: `
        <p>Thanks for signing up. We're excited to have you on board.</p>
        <p>Get started by exploring your dashboard and setting up your profile.</p>
      `,
      ctaText: 'Go to Dashboard',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    }),
  }),

  /**
   * Password reset email
   */
  passwordReset: (resetUrl: string) => ({
    subject: 'Reset your password',
    html: createSimpleEmail({
      title: 'Reset Your Password',
      body: `
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #9ca3af; font-size: 12px;">This link expires in 1 hour.</p>
      `,
      ctaText: 'Reset Password',
      ctaUrl: resetUrl,
    }),
  }),

  /**
   * Email verification
   */
  verifyEmail: (verifyUrl: string) => ({
    subject: 'Verify your email',
    html: createSimpleEmail({
      title: 'Verify Your Email',
      body: `
        <p>Please verify your email address by clicking the button below.</p>
      `,
      ctaText: 'Verify Email',
      ctaUrl: verifyUrl,
    }),
  }),
};
