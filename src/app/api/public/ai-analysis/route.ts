import { NextRequest, NextResponse } from 'next/server';
import { Lead, Clinic } from '@/db/models';
import { runAIHairAnalysis } from '@/lib/ai-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
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

    // Run the computer vision analysis (Gemini / fallback simulator)
    const aiResult = await runAIHairAnalysis(photos);

    // Build the annotation notes summarizing the diagnostics
    let notesSummary = `Norwood Stage: ${aiResult.norwoodStage}. Recommended: ${aiResult.procedureAssessment.preliminaryRecommendation}. Estimated Grafts: ${aiResult.estimatedGraftRequirement?.minimumGrafts || 0}-${aiResult.estimatedGraftRequirement?.maximumGrafts || 0}. Observations: ${aiResult.clinicalObservations?.join(', ') || 'N/A'}`;
    if (clientNotes) {
      notesSummary = `${clientNotes}. ${notesSummary}`;
    }

    // Create the lead record
    const lead = await Lead.create({
      clinicId: clinic.id,
      name,
      email,
      phone: phone || '',
      source: 'Android App',
      status: 'NEW',
      notes: notesSummary,
    });

    return NextResponse.json({
      success: true,
      analysis: aiResult,
      leadId: lead.id,
    });
  } catch (error: any) {
    console.error('Public AI Analysis error:', error);
    return NextResponse.json({ error: error.message || 'AI Analysis failed' }, { status: 500 });
  }
}
