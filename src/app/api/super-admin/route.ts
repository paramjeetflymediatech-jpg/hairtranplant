import { NextResponse } from 'next/server';
import { Clinic, User, Subscription, Patient, Lead } from '@/db/models';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    // Fetch clinics and associated subscriptions, users, and patients
    const clinics = await Clinic.findAll({
      include: [
        { model: Subscription, as: 'subscription' },
        { model: User, as: 'users' },
        { model: Patient, as: 'patients' },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Fetch public website contact queries / leads
    const leads = await Lead.findAll({
      where: { source: 'Website Contact Form' },
      order: [['createdAt', 'DESC']],
    });

    const totalClinics = clinics.length;
    const activeSubscriptions = clinics.filter((c) => c.subscriptionStatus === 'ACTIVE').length;
    const totalPatients = await Patient.count();
    
    let mrr = 0;
    clinics.forEach((c) => {
      if (c.subscriptionPlan === 'STARTER') mrr += 149;
      else if (c.subscriptionPlan === 'PROFESSIONAL') mrr += 299;
      else if (c.subscriptionPlan === 'ENTERPRISE') mrr += 599;
    });

    return NextResponse.json({
      metrics: {
        totalClinics,
        activeSubscriptions,
        mrr,
        annualRunRate: mrr * 12,
        totalPatients,
      },
      clinics,
      leads,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch platform metrics' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // Delete lead from the database
    await Lead.destroy({ where: { id: leadId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete lead' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const { leadId, status } = await req.json();

    if (!leadId || !status) {
      return NextResponse.json({ error: 'Lead ID and status are required' }, { status: 400 });
    }

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Update status field
    lead.status = status;
    await lead.save();

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update lead status' }, { status: 500 });
  }
}
