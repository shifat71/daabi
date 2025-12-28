/**
 * Email Service for Daabi
 * 
 * This service provides email sending functionality for:
 * - Email verification
 * - Password reset
 * - Notifications
 * 
 * Configure your SMTP settings in .env.local:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM
 */

interface EmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

interface EmailTemplateData {
    name?: string
    verificationLink?: string
    resetLink?: string
    expiresIn?: string
}

// Check if email is configured
function isEmailConfigured(): boolean {
    return !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD
    )
}

/**
 * Send an email
 * For production, integrate with your preferred email service:
 * - Nodemailer with SMTP
 * - SendGrid
 * - AWS SES
 * - Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options

    // In development, log the email instead of sending
    if (process.env.NODE_ENV === 'development' || !isEmailConfigured()) {
        console.log('========== EMAIL (Development Mode) ==========')
        console.log(`To: ${to}`)
        console.log(`Subject: ${subject}`)
        console.log(`HTML: ${html.substring(0, 500)}...`)
        console.log('===============================================')
        return true
    }

    try {
        // Production email sending
        // Uncomment and configure based on your email provider:

        // Option 1: Using fetch with a transactional email API (e.g., Resend, SendGrid)
        /*
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'noreply@daabi.app',
            to,
            subject,
            html,
            text,
          }),
        })
        return response.ok
        */

        // For now, log and return true (integrate your email provider)
        console.log(`Email would be sent to: ${to}`)
        return true
    } catch (error) {
        console.error('Failed to send email:', error)
        return false
    }
}

/**
 * Generate email verification email
 */
export function generateVerificationEmail(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const { name = 'Student', verificationLink, expiresIn = '24 hours' } = data

    const subject = '🎓 Verify your Daabi account'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Daabi</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your Campus, Your Voice</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Welcome, ${name}! 👋</h2>
    
    <p>Thanks for signing up for Daabi. Please verify your email address to get started.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        Verify Email Address
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      This link will expire in <strong>${expiresIn}</strong>.
    </p>
    
    <p style="color: #666; font-size: 14px;">
      If you didn't create an account on Daabi, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; margin-bottom: 0;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${verificationLink}" style="color: #667eea; word-break: break-all;">${verificationLink}</a>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Daabi. Built for students, by students.</p>
  </div>
</body>
</html>
`

    const text = `
Welcome to Daabi, ${name}!

Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in ${expiresIn}.

If you didn't create an account on Daabi, you can safely ignore this email.

---
© ${new Date().getFullYear()} Daabi. Built for students, by students.
`

    return { subject, html, text }
}

/**
 * Generate password reset email
 */
export function generatePasswordResetEmail(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const { name = 'Student', resetLink, expiresIn = '1 hour' } = data

    const subject = '🔐 Reset your Daabi password'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Daabi</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Password Reset Request</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
    
    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      This link will expire in <strong>${expiresIn}</strong>.
    </p>
    
    <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        ⚠️ <strong>Security tip:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; margin-bottom: 0;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Daabi. Built for students, by students.</p>
  </div>
</body>
</html>
`

    const text = `
Hi ${name},

We received a request to reset your password.

Click the link below to choose a new password:

${resetLink}

This link will expire in ${expiresIn}.

If you didn't request a password reset, please ignore this email.

---
© ${new Date().getFullYear()} Daabi. Built for students, by students.
`

    return { subject, html, text }
}

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(
    email: string,
    name: string,
    verificationLink: string
): Promise<boolean> {
    const { subject, html, text } = generateVerificationEmail({
        name,
        verificationLink,
        expiresIn: '24 hours',
    })

    return sendEmail({ to: email, subject, html, text })
}

/**
 * Send password reset email to user
 */
export async function sendPasswordResetEmail(
    email: string,
    name: string,
    resetLink: string
): Promise<boolean> {
    const { subject, html, text } = generatePasswordResetEmail({
        name,
        resetLink,
        expiresIn: '1 hour',
    })

    return sendEmail({ to: email, subject, html, text })
}
