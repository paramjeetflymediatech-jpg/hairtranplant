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
  Clinic,
  ensureDbSynced,
} from '@/db/models';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patientInclude = [
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
    ];

    let patient = await Patient.findOne({
      where: {
        email: session.email,
        ...(session.clinicId ? { clinicId: session.clinicId } : {}),
      },
      include: patientInclude,
    });

    if (!patient) {
      patient = await Patient.findOne({
        where: { email: session.email },
        include: patientInclude,
      });
    }

    if (!patient) {
      let clinicId = session.clinicId;
      if (!clinicId) {
        const defaultClinic = await Clinic.findOne({ where: { slug: 'asg-hair' } });
        clinicId = defaultClinic?.id || (await Clinic.findOne())?.id;
      }

      if (clinicId) {
        patient = await Patient.create({
          clinicId,
          name: session.name || 'Patient',
          email: session.email,
          status: 'CONSULTATION',
          source: 'Mobile App Sign-In',
          notes: 'Auto-linked patient profile on mobile portal access.',
        });
      }
    }

    if (!patient) {
      return NextResponse.json({
        success: true,
        patient: {
          name: session.name || 'Patient',
          email: session.email,
          status: 'CONSULTATION',
          hairAnalyses: [],
          appointments: [],
          treatmentPlans: [],
          photos: [],
        },
        surgeonName: 'Dr. Alexander Vance',
      });
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
    console.error('Portal dashboard error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch portal data' }, { status: 500 });
  }
}
