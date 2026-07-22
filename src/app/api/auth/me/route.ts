import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { User, Clinic } from '@/db/models';

export const dynamic = 'force-dynamic';

export async function GET() {
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
}
