import { NextRequest, NextResponse } from 'next/server';
import { FollowUp, Patient } from '@/db/models';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const followUps = await FollowUp.findAll({
      where: { clinicId },
      include: [{ model: Patient, as: 'patient' }],
      order: [['followUpDate', 'ASC']],
    });

    return NextResponse.json({ followUps });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch follow-ups' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { followUpId, status, notes } = await req.json();
    const followUp = await FollowUp.findByPk(followUpId);

    if (!followUp) return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
    enforceTenantAccess(session, followUp.clinicId);

    if (status) followUp.status = status;
    if (notes !== undefined) followUp.notes = notes;

    await followUp.save();

    return NextResponse.json({ followUp });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update follow-up' }, { status: 500 });
  }
}
