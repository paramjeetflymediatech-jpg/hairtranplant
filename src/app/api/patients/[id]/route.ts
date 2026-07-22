import { NextRequest, NextResponse } from 'next/server';
import {
  Patient,
  Appointment,
  Consultation,
  HairAnalysis,
  TreatmentPlan,
  Surgery,
  SurgeryGraft,
  PatientPhoto,
  FollowUp,
  Payment,
} from '@/db/models';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params;
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
    }

    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patient = await Patient.findByPk(patientId, {
      include: [
        { model: Appointment, as: 'appointments' },
        { model: Consultation, as: 'consultations' },
        { model: HairAnalysis, as: 'hairAnalyses' },
        { model: TreatmentPlan, as: 'treatmentPlans' },
        {
          model: Surgery,
          as: 'surgeries',
          include: [{ model: SurgeryGraft, as: 'grafts' }],
        },
        { model: PatientPhoto, as: 'photos' },
        { model: FollowUp, as: 'followUps' },
        { model: Payment, as: 'payments' },
      ],
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    enforceTenantAccess(session, patient.clinicId);

    return NextResponse.json({ patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch patient details' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params;
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
    }

    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    enforceTenantAccess(session, patient.clinicId);

    const surgeryIds = (await Surgery.findAll({ where: { patientId }, attributes: ['id'] })).map(s => s.id);
    if (surgeryIds.length > 0) {
      await SurgeryGraft.destroy({ where: { surgeryId: { [Op.in]: surgeryIds } } });
    }
    
    await Appointment.destroy({ where: { patientId } });
    await Consultation.destroy({ where: { patientId } });
    await HairAnalysis.destroy({ where: { patientId } });
    await TreatmentPlan.destroy({ where: { patientId } });
    await Surgery.destroy({ where: { patientId } });
    await PatientPhoto.destroy({ where: { patientId } });
    await FollowUp.destroy({ where: { patientId } });
    await Payment.destroy({ where: { patientId } });

    await patient.destroy();

    return NextResponse.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete patient' }, { status: 500 });
  }
}
