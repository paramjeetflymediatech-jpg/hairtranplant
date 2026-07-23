import { NextRequest, NextResponse } from 'next/server';
import { User, Clinic } from '@/db/models';
import { verifyPassword, signToken } from '@/lib/auth';
import { ensureDbSynced } from '@/db';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Clinic, as: 'clinic' }],
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinicId: user.clinicId,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        clinicId: user.clinicId,
      },
      token,
    });

    res.cookies.set('graftdesk_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
