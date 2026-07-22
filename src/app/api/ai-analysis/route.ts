import { NextRequest, NextResponse } from 'next/server';
import { HairAnalysis, Patient } from '@/db/models';
import { runAIHairAnalysis } from '@/lib/ai-engine';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const { patientId, photos } = await req.json();

    if (!photos) {
      return NextResponse.json({ error: 'At least one photo view is required for AI analysis' }, { status: 400 });
    }

    const aiResult = await runAIHairAnalysis(photos);

    let savedAnalysis = null;
    if (patientId) {
      const patient = await Patient.findByPk(patientId);
      if (patient) {
        enforceTenantAccess(session, patient.clinicId);

        savedAnalysis = await HairAnalysis.create({
          clinicId,
          patientId,
          frontPhoto: photos.frontPhoto,
          topPhoto: photos.topPhoto,
          leftPhoto: photos.leftPhoto,
          rightPhoto: photos.rightPhoto,
          backPhoto: photos.backPhoto,
          hairLossStage: aiResult.norwoodStage,
          hairDensity: aiResult.donorArea?.densityEstimateGraftsPerCm2 ? `${aiResult.donorArea.densityEstimateGraftsPerCm2} grafts/cm²` : 'N/A',
          donorAreaQuality: aiResult.donorArea?.rating === 'NOT_ASSESSABLE'
            ? 'Not Assessable (Photo Missing/Blurry)'
            : `${aiResult.donorArea?.rating || 'N/A'} (${aiResult.donorArea?.qualityScore || 'N/A'}/100)`,
          estimatedMinGrafts: aiResult.estimatedGraftRequirement?.minimumGrafts || null,
          estimatedMaxGrafts: aiResult.estimatedGraftRequirement?.maximumGrafts || null,
          aiAnalysis: JSON.stringify(aiResult),
          doctorVerified: false,
        });

        patient.hairLossStage = aiResult.norwoodStage;
        await patient.save();
      }
    }

    return NextResponse.json({
      success: true,
      analysis: aiResult,
      savedAnalysis,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI Analysis failed' }, { status: 500 });
  }
}
