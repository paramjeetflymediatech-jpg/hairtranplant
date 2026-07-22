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
  User,
} from '@/db/models';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patient = await Patient.findOne({
      where: {
        email: session.email,
        clinicId: session.clinicId,
      },
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
      ],
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Find the surgeon details from user
    const patientData = patient as any;
    const surgery = patientData.surgeries && patientData.surgeries.length > 0 ? patientData.surgeries[0] : null;
    let surgeonName = 'Dr. Alexander Vance';
    if (surgery && surgery.doctorId) {
      const surgeon = await User.findByPk(surgery.doctorId, { attributes: ['name'] });
      if (surgeon) surgeonName = surgeon.name;
    }

    return NextResponse.json({
      success: true,
      patient,
      surgeonName,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch portal data' }, { status: 500 });
  }
}
