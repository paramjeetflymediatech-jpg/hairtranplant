import { NextRequest, NextResponse } from 'next/server';
import { Lead, Patient, ensureDbSynced } from '@/db/models';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const { leadId, patientId } = await req.json();

    if (!leadId && !patientId) {
      return NextResponse.json({ error: 'leadId or patientId is required' }, { status: 400 });
    }

    if (leadId) {
      const lead = await Lead.findByPk(leadId);
      if (lead) {
        lead.whatsappTracked = true;
        await lead.save();
        console.log(`[WhatsApp Tracker] Lead ${leadId} (${lead.name}) is now tracked via WhatsApp.`);
      }
    }

    if (patientId) {
      const patient = await Patient.findByPk(patientId);
      if (patient) {
        patient.whatsappTracked = true;
        await patient.save();
        console.log(`[WhatsApp Tracker] Patient ${patientId} (${patient.name}) is now tracked via WhatsApp.`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp tracking activated successfully.',
    });
  } catch (error: any) {
    console.error('WhatsApp tracking update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update WhatsApp tracking status' }, { status: 500 });
  }
}
