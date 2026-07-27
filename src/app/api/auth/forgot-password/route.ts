import { NextRequest, NextResponse } from 'next/server';
import { User, Clinic, ensureDbSynced } from '@/db/models';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const formattedEmail = email.toLowerCase().trim();

    // Find the user matching email, role PATIENT and eagerly load their Clinic details
    const user = (await User.findOne({
      where: {
        email: formattedEmail,
        role: 'PATIENT',
      },
      include: [{ model: Clinic, as: 'clinic' }],
    })) as any;

    if (!user) {
      return NextResponse.json({
        error: 'No registered patient account was found with this email address.',
      }, { status: 404 });
    }

    // Resolve dynamic clinic name (fallback to 'GraftDesk')
    const clinicName = user.clinic?.name || 'GraftDesk';

    // Generate secure token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour expiration
    await user.save();

    // Get the base URL from the request host
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    
    // Generate clinic-specific reset link if the user is associated with a clinic
    let resetUrl = '';
    if (user.clinic?.slug) {
      resetUrl = `${protocol}://${host}/clinics/${user.clinic.slug}/reset-password?token=${token}`;
    } else {
      resetUrl = `${protocol}://${host}/reset-password?token=${token}`;
    }

    // Log reset URL to console for development/testing
    console.log('===================================================');
    console.log(`PASSWORD RESET REQUESTED FOR: ${formattedEmail} at ${clinicName}`);
    console.log(`RESET LINK: ${resetUrl}`);
    console.log('===================================================');

    // Send the actual email using SMTP credentials from .env
    await sendEmail({
      to: formattedEmail,
      subject: `Reset Your ${clinicName} Password`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0d9488; text-align: center;">${clinicName} Password Reset</h2>
          <p>Hello,</p>
          <p>A password reset request was received for your ${clinicName} patient account. You can reset your password by clicking the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">© 2026 ${clinicName}. All rights reserved.</p>
        </div>
      `,
    });
    
    return NextResponse.json({
      success: true,
      message: 'A secure password reset link has been sent to your email.',
      debugLink: resetUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to request password reset.' }, { status: 500 });
  }
}
