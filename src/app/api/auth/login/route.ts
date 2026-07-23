import { NextRequest, NextResponse } from 'next/server';
import { User, Clinic, ensureDbSynced } from '@/db/models';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const { email, password, clinicSlug, clinicId } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const formattedEmail = email.toLowerCase().trim();

    const candidateUsers = await User.findAll({
      where: { email: formattedEmail },
      include: [{ model: Clinic, as: 'clinic' }],
    });

    if (!candidateUsers || candidateUsers.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Filter by clinic if specified
    let targetCandidates = candidateUsers;
    if (clinicSlug) {
      targetCandidates = candidateUsers.filter((u: any) => u.clinic?.slug === clinicSlug);
    } else if (clinicId) {
      targetCandidates = candidateUsers.filter((u: any) => u.clinicId === clinicId);
    }

    if (targetCandidates.length === 0) {
      targetCandidates = candidateUsers;
    }

    let authenticatedUser: any = null;
    let isStopped = false;

    for (const candidate of targetCandidates) {
      if (!candidate.password) continue;
      const isMatch = await verifyPassword(password, candidate.password);
      if (isMatch) {
        if (!candidate.isActive) {
          isStopped = true;
          continue;
        }
        authenticatedUser = candidate;
        break;
      }
    }

    if (!authenticatedUser) {
      if (isStopped) {
        return NextResponse.json({ error: 'Your account has been stopped/deactivated by your administrator.' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    authenticatedUser.lastLoginAt = new Date();
    await authenticatedUser.save();

    const token = signToken({
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      role: authenticatedUser.role,
      clinicId: authenticatedUser.clinicId,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        avatar: authenticatedUser.avatar,
        clinicId: authenticatedUser.clinicId,
        clinic: authenticatedUser.clinic,
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
