import { NextRequest, NextResponse } from 'next/server';
import { PatientPhoto, Patient } from '@/db/models';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';

export async function POST(
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

    const { type, imageUrl, capturedAt, notes } = await req.json();

    if (!imageUrl || !type || !capturedAt) {
      return NextResponse.json({ error: 'Image, type, and captured date are required' }, { status: 400 });
    }

    const photo = await PatientPhoto.create({
      clinicId,
      patientId,
      type,
      imageUrl,
      capturedAt,
      notes: notes || '',
      isPublicConsent: false,
    });

    return NextResponse.json({ success: true, photo }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to upload photo' }, { status: 500 });
  }
}
