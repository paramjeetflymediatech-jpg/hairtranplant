import { NextRequest, NextResponse } from 'next/server';
import { Surgery, SurgeryGraft, Patient, User } from '@/db/models';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const surgeries = await Surgery.findAll({
      where: { clinicId },
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'avatar'] },
        { model: SurgeryGraft, as: 'grafts' },
      ],
      order: [['surgeryDate', 'DESC']],
    });

    return NextResponse.json({ surgeries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch surgeries' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { surgeryId, extractedGrafts, implantedGrafts, status, graftsBreakdown } = await req.json();

    const surgery = await Surgery.findByPk(surgeryId, {
      include: [{ model: SurgeryGraft, as: 'grafts' }],
    });

    if (!surgery) return NextResponse.json({ error: 'Surgery not found' }, { status: 404 });
    enforceTenantAccess(session, surgery.clinicId);

    if (extractedGrafts !== undefined) surgery.extractedGrafts = extractedGrafts;
    if (implantedGrafts !== undefined) surgery.implantedGrafts = implantedGrafts;
    if (status !== undefined) surgery.status = status;

    await surgery.save();

    if (graftsBreakdown && Array.isArray(graftsBreakdown)) {
      for (const item of graftsBreakdown) {
        let graft = await SurgeryGraft.findOne({
          where: { surgeryId: surgery.id, graftType: item.graftType },
        });

        if (graft) {
          graft.quantity = item.quantity;
          await graft.save();
        } else {
          await SurgeryGraft.create({
            surgeryId: surgery.id,
            graftType: item.graftType,
            quantity: item.quantity,
          });
        }
      }
    }

    const updatedSurgery = await Surgery.findByPk(surgeryId, {
      include: [
        { model: Patient, as: 'patient' },
        { model: SurgeryGraft, as: 'grafts' },
      ],
    });

    return NextResponse.json({ surgery: updatedSurgery });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update surgery' }, { status: 500 });
  }
}
