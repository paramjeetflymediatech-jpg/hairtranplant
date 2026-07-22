import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import Clinic from '@/db/models/Clinic';

export async function GET(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || !session.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clinic = await Clinic.findByPk(session.clinicId);
    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }
    return NextResponse.json({ clinic });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch clinic' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || !session.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, phone, address, city, state, country, timezone, logo, backgroundImage, themeColor } = await req.json();

    const clinic = await Clinic.findByPk(session.clinicId);
    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    await clinic.update({
      name,
      email,
      phone,
      address,
      city,
      state,
      country,
      timezone,
      logo,
      backgroundImage,
      themeColor
    });

    return NextResponse.json({ success: true, clinic });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update clinic' }, { status: 500 });
  }
}
