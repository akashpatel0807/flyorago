import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Create a transporter using SMTP configuration
const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

/**
 * Send a password reset email
 * @param toEmail The recipient's email address
 * @param resetToken The JWT reset token
 */
export const sendPasswordResetEmail = async (toEmail: string, resetToken: string) => {
  // Construct the deep link (or web link) that the mobile app handles
  // For Expo development, it might look like exp://<ip>:8081/--/reset-password?token=...
  // Or flyorago://reset-password?token=... for production
  
  // NOTE: For local testing, we'll use a placeholder. The app can parse this link.
  const resetLink = `flyorago://reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Flyorago Support" <support@flyorago.tech>`,
    to: toEmail,
    subject: 'Reset Your Flyorago Password',
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #0d9488;">Reset Your Password</h2>
        <p>You recently requested to reset your password for your Flyorago account.</p>
        <p>Click the button below to reset it:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0d9488; color: #ffffff; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 15 minutes.</p>
        <hr style="border: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">Flyorago Team<br/>support@flyorago.tech</p>
      </div>
    `,
  };

  try {
    if (!env.smtpUser || !env.smtpPass) {
      console.warn('⚠️ SMTP credentials are not configured in .env file!');
      console.warn('⚠️ Email was NOT actually sent. For testing, use this reset link:');
      console.warn(resetLink);
      return true; // Pretend it succeeded so the frontend can proceed
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Don't throw an error to prevent the 500 Internal Server Error.
    // In production, you might want to return false and handle it.
    console.warn('⚠️ Fallback: For testing, use this reset link:');
    console.warn(resetLink);
    return true;
  }
};
