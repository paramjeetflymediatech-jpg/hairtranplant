import { NextRequest, NextResponse } from 'next/server';
import { Appointment, Patient, User } from '@/db/models';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const appointments = await Appointment.findAll({
      where: { clinicId },
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['appointmentDate', 'ASC'], ['startTime', 'ASC']],
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const body = await req.json();

    if (!body.patientId || !body.appointmentDate || !body.startTime || !body.endTime) {
      return NextResponse.json({ error: 'Missing required appointment fields' }, { status: 400 });
    }

    const appointment = await Appointment.create({
      ...body,
      clinicId,
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create appointment' }, { status: 500 });
  }
}
