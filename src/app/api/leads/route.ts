import { NextRequest, NextResponse } from 'next/server';
import { Lead, ensureDbSynced } from '@/db/models';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const whereClause: any = {};
    if (clinicId) {
      whereClause.clinicId = clinicId;
    }

    const leads = await Lead.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic association required' }, { status: 400 });
    }

    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Lead name is required' }, { status: 400 });
    }

    const lead = await Lead.create({
      ...body,
      clinicId,
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/leads error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create lead' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { leadId, status } = await req.json();
    if (!leadId || !status) {
      return NextResponse.json({ error: 'leadId and status are required' }, { status: 400 });
    }

    const lead = await Lead.findByPk(leadId);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    enforceTenantAccess(session, lead.clinicId);

    lead.status = status;
    await lead.save();

    return NextResponse.json({ lead });
  } catch (error: any) {
    console.error('PATCH /api/leads error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update lead' }, { status: 500 });
  }
}
