import { NextRequest, NextResponse } from 'next/server';
import { User, Patient, HairAnalysis, PatientPhoto, Lead, Clinic, ensureDbSynced } from '@/db/models';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const { name, email, password, phone, leadId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const formattedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: formattedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Resolve Clinic ID (from Lead if provided, otherwise default to asg-hair)
    let clinicId: string | null = null;
    let guestLead: any = null;

    if (leadId) {
      guestLead = await Lead.findByPk(leadId);
      if (guestLead) {
        clinicId = guestLead.clinicId;
      }
    }

    if (!clinicId) {
      const defaultClinic = await Clinic.findOne({ where: { slug: 'asg-hair' } });
      if (defaultClinic) {
        clinicId = defaultClinic.id;
      } else {
        // Fallback to first clinic
        const firstClinic = await Clinic.findOne();
        clinicId = firstClinic ? firstClinic.id : null;
      }
    }

    if (!clinicId) {
      return NextResponse.json({ error: 'No clinic found to associate with this patient' }, { status: 500 });
    }

    // 1. Create the User with role PATIENT
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      clinicId,
      name,
      email: formattedEmail,
      password: hashedPassword,
      role: 'PATIENT',
      phone: phone || guestLead?.phone || '',
      isActive: true,
    });

    // 2. Create the Patient record linked to the user
    const patient = await Patient.create({
      clinicId,
      name,
      email: formattedEmail,
      phone: phone || guestLead?.phone || '',
      source: guestLead?.source || 'Online Hair Test',
      status: 'CONSULTATION',
      notes: guestLead?.notes || 'Patient self-registered via Hair Test.',
    });

    // 3. If there is a guest Lead, convert its diagnostic details
    if (guestLead) {
      // Parse photos and analysis data
      let photos: any = {};
      let aiResult: any = null;

      try {
        if (guestLead.photos) {
          photos = JSON.parse(guestLead.photos);
        }
      } catch (e) {
        console.error('Failed to parse guest photos JSON:', e);
      }

      try {
        if (guestLead.hairAnalysisData) {
          aiResult = JSON.parse(guestLead.hairAnalysisData);
        }
      } catch (e) {
        console.error('Failed to parse guest hair analysis JSON:', e);
      }

      // Create HairAnalysis record
      await HairAnalysis.create({
        clinicId,
        patientId: patient.id,
        frontPhoto: photos.frontPhoto || '',
        topPhoto: photos.topPhoto || '',
        leftPhoto: photos.leftPhoto || '',
        rightPhoto: photos.rightPhoto || '',
        backPhoto: photos.backPhoto || '',
        hairLossStage: aiResult?.norwoodStage || 'UNCERTAIN',
        hairDensity: aiResult?.donorArea?.rating || 'GOOD',
        donorAreaQuality: aiResult?.donorArea?.rating || 'GOOD',
        estimatedMinGrafts: aiResult?.estimatedGraftRequirement?.minimumGrafts || 1500,
        estimatedMaxGrafts: aiResult?.estimatedGraftRequirement?.maximumGrafts || 2000,
        aiAnalysis: guestLead.hairAnalysisData || '',
        doctorVerified: false,
      });

      // Save photos to PatientPhoto gallery
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
            clinicId,
            patientId: patient.id,
            type: p.type,
            imageUrl: formattedUrl,
            capturedAt,
            notes: `Auto-saved from AI Hair Test (${p.note})`,
            isPublicConsent: false,
          });
        }
      }

      // Mark the Lead as CONVERTED
      guestLead.status = 'CONVERTED';
      guestLead.notes = `${guestLead.notes || ''}\n[CONVERTED] Patient registered as user ${user.id}.`.trim();
      if (phone) {
        guestLead.phone = phone;
      }
      await guestLead.save();
    }

    // 4. Generate login token
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinicId: user.clinicId,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
      },
      patient: {
        id: patient.id,
      },
      token,
    });

    res.cookies.set('graftdesk_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch (error: any) {
    console.error('Patient registration error:', error);
    return NextResponse.json({ error: error.message || 'Patient registration failed' }, { status: 500 });
  }
}
