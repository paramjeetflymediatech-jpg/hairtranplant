import { NextRequest, NextResponse } from 'next/server';
import { User, Clinic, Subscription, ensureDbSynced } from '@/db/models';
import { hashPassword, signToken, signRefreshToken, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const { name, email, password, clinicName, phone, plan = 'PROFESSIONAL' } = await req.json();

    if (!name || !email || !password || !clinicName) {
      return NextResponse.json({ error: 'Name, email, password, and clinic name are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const slug = clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    const clinic = await Clinic.create({
      name: clinicName,
      slug,
      email,
      phone,
      subscriptionPlan: plan,
      subscriptionStatus: 'ACTIVE',
    });

    await Subscription.create({
      clinicId: clinic.id,
      plan,
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      billingCycle: 'ANNUAL',
      amount: plan === 'STARTER' ? 149 : plan === 'ENTERPRISE' ? 599 : 299,
    });

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      clinicId: clinic.id,
      name,
      email,
      password: hashedPassword,
      role: 'CLINIC_ADMIN',
      phone,
      isActive: true,
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinicId: user.clinicId,
    };

    const token = signToken(tokenPayload, '7d');
    const refreshToken = signRefreshToken(tokenPayload, '30d');

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
      },
      clinic: {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
      },
      token,
      refreshToken,
    });

    setAuthCookies(res, token, refreshToken);

    return res;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
