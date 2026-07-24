import { NextRequest, NextResponse } from 'next/server';
import { Lead, Clinic, Patient, HairAnalysis, PatientPhoto, ensureDbSynced } from '@/db/models';
import { runAIHairAnalysis } from '@/lib/ai-engine';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const { name, email, phone, photos, notes: clientNotes, clinicSlug } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    if (!photos || Object.keys(photos).length === 0) {
      return NextResponse.json({ error: 'At least one photo view is required for AI analysis' }, { status: 400 });
    }

    // Resolve the Target Clinic
    const targetSlug = clinicSlug || 'asg-hair';
    const clinic = await Clinic.findOne({ where: { slug: targetSlug } });
    if (!clinic) {
      return NextResponse.json({ error: `Clinic with slug "${targetSlug}" not found` }, { status: 404 });
    }

    // Run the computer vision analysis
    const aiResult = await runAIHairAnalysis(photos);

    // Build the annotation notes summarizing the diagnostics
    let notesSummary = `Norwood Stage: ${aiResult.norwoodStage}. Recommended: ${aiResult.procedureAssessment.preliminaryRecommendation}. Estimated Grafts: ${aiResult.estimatedGraftRequirement?.minimumGrafts || 0}-${aiResult.estimatedGraftRequirement?.maximumGrafts || 0}. Observations: ${aiResult.clinicalObservations?.join(', ') || 'N/A'}`;
    if (clientNotes) {
      notesSummary = `${clientNotes}. ${notesSummary}`;
    }

    // Check if the user has an active patient session
    const session = await getSessionUser();
    let patientId = null;
    let isGuest = true;

    if (session && session.role === 'PATIENT') {
      const patient = await Patient.findOne({ where: { email: session.email, clinicId: session.clinicId } });
      if (patient) {
        patientId = patient.id;
        isGuest = false;

        // Save HairAnalysis directly for registered patient
        await HairAnalysis.create({
          clinicId: session.clinicId,
          patientId: patient.id,
          frontPhoto: photos.frontPhoto || '',
          topPhoto: photos.topPhoto || '',
          leftPhoto: photos.leftPhoto || '',
          rightPhoto: photos.rightPhoto || '',
          backPhoto: photos.backPhoto || '',
          hairLossStage: aiResult.norwoodStage || 'UNCERTAIN',
          hairDensity: aiResult.donorArea?.rating || 'GOOD',
          donorAreaQuality: aiResult.donorArea?.rating || 'GOOD',
          estimatedMinGrafts: aiResult.estimatedGraftRequirement?.minimumGrafts || 1500,
          estimatedMaxGrafts: aiResult.estimatedGraftRequirement?.maximumGrafts || 2000,
          aiAnalysis: JSON.stringify(aiResult),
          doctorVerified: false,
        });

        // Copy photos to PatientPhoto gallery
        const capturedAt = new Date().toISOString().split('T')[0];
        const photoTypes = [
          { key: 'frontPhoto', type: 'BEFORE' as const, note: 'Front View' },
          { key: 'topPhoto', type: 'BEFORE' as const, note: 'Crown View' },
          { key: 'backPhoto', type: 'BEFORE' as const, note: 'Back View' },
        ];
        for (const p of photoTypes) {
          const rawPhoto = photos[p.key];
          if (rawPhoto) {
            const formattedUrl = rawPhoto.startsWith('data:') ? rawPhoto : `data:image/jpeg;base64,${rawPhoto}`;
            await PatientPhoto.create({
              clinicId: session.clinicId,
              patientId: patient.id,
              type: p.type,
              imageUrl: formattedUrl,
              capturedAt,
              notes: `Auto-saved from AI Hair Test (${p.note})`,
              isPublicConsent: false,
            });
          }
        }
      }
    }

    // Create the lead record tied to this specific clinic, saving photos & full AI analysis
    // For logged-in users, set status to CONVERTED immediately
    const lead = await Lead.create({
      clinicId: clinic.id,
      name,
      email,
      phone: phone || '',
      source: 'Online Hair Test',
      status: isGuest ? 'NEW' : 'CONVERTED',
      notes: `${isGuest ? '' : '[SESSION ENROLLED] '}${notesSummary}`,
      photos: JSON.stringify(photos),
      hairAnalysisData: JSON.stringify(aiResult),
      whatsappTracked: false,
    });

    // Simulate WhatsApp Message logs for tracking
    console.log(`\n======================================================`);
    console.log(`[WhatsApp Tracking System] Simulated Alert Triggered!`);
    console.log(`To: ${phone || 'Unknown Phone'}`);
    console.log(`Lead ID: ${lead.id}`);
    console.log(`Message: "Hello ${name}, thank you for taking the ASG Hair Test! Your visual analysis shows Norwood Stage: ${aiResult.norwoodStage}. Standard graft requirement is estimated at ${aiResult.estimatedGraftRequirement?.minimumGrafts || 0}-${aiResult.estimatedGraftRequirement?.maximumGrafts || 0} grafts. A specialist from our Jalandhar clinic will follow up with you on WhatsApp shortly."`);
    console.log(`======================================================\n`);

    return NextResponse.json({
      success: true,
      analysis: aiResult,
      leadId: lead.id,
      isGuest,
      patientId,
    });
  } catch (error: any) {
    console.error('Public AI Analysis error:', error);
    return NextResponse.json({ error: error.message || 'AI Analysis failed' }, { status: 500 });
  }
}
