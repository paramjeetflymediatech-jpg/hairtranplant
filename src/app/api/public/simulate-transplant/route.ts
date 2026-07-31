import { NextRequest, NextResponse } from 'next/server';
import { POST as handleHairTransplant } from '@/app/api/ai/hair-transplant/route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const res = await handleHairTransplant(req);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Hair transplant simulation failed',
          message: data.error || 'Simulation failed'
        }, 
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      isDemo: false,
      provider: data.provider,
      model: data.model,
      simulatedPhotoUrl: data.image,
      image: data.image,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Simulation failed' },
      { status: 500 }
    );
  }
}
