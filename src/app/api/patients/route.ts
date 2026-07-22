import { NextRequest, NextResponse } from 'next/server';
import { Patient, Surgery, HairAnalysis, Appointment, User } from '@/db/models';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const clinicId = enforceTenantAccess(session);

    const whereClause: any = { clinicId };
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const patients = await Patient.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Surgery, as: 'surgeries' },
        { model: HairAnalysis, as: 'hairAnalyses' },
        { model: Appointment, as: 'appointments' },
      ],
    });

    return NextResponse.json({ patients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    const patient = await Patient.create({
      ...body,
      clinicId,
    });

    if (body.email) {
      const existingUser = await User.findOne({ where: { email: body.email } });
      if (!existingUser) {
        const hashedPassword = await hashPassword('password123');
        await User.create({
          clinicId,
          name: body.name,
          email: body.email,
          password: hashedPassword,
          role: 'PATIENT',
          phone: body.phone || null,
          isActive: true,
        });
      }
    }

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create patient' }, { status: 500 });
  }
}
