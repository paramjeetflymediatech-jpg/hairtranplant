import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, verifyPassword, hashPassword, signToken } from '@/lib/auth';
import { User, Clinic, ensureDbSynced } from '@/db/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await User.findByPk(session.userId, {
      attributes: { exclude: ['password'] },
      include: [{ model: Clinic, as: 'clinic' }],
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await User.findByPk(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone, avatar, currentPassword, newPassword } = body;

    // Handle Password Change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      if (user.password) {
        const isMatch = await verifyPassword(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }
      }

      user.password = await hashPassword(newPassword);
    }

    // Handle Profile Fields Update
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    // Re-sign token with updated info
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinicId: user.clinicId,
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      clinicId: user.clinicId,
    };

    const res = NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse,
      token,
    });

    res.cookies.set('graftdesk_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
