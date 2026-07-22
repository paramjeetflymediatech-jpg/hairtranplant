import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/db/models';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);

    const users = await User.findAll({
      where: {
        clinicId,
        role: {
          [Op.in]: ['DOCTOR', 'CONSULTANT', 'CLINIC_ADMIN'],
        },
        isActive: true,
      },
      attributes: ['id', 'name', 'role', 'avatar'],
      order: [['name', 'ASC']],
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}
