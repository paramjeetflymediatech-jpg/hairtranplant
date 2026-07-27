import { NextRequest, NextResponse } from 'next/server';
import { User, ensureDbSynced } from '@/db/models';
import { hashPassword } from '@/lib/auth';
import { Op } from 'sequelize';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    // Find the user with a valid, non-expired reset token
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        error: 'The password reset link is invalid or has expired. Please request a new one.',
      }, { status: 400 });
    }

    // Hash and update the password
    user.password = await hashPassword(newPassword);
    
    // Clear reset token fields so the token is single-use and cannot be used again
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reset password.' }, { status: 500 });
  }
}
