import { NextRequest, NextResponse } from 'next/server';
import { Appointment, Patient, User } from '@/db/models';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const appointments = await Appointment.findAll({
      where: { clinicId },
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['appointmentDate', 'ASC'], ['startTime', 'ASC']],
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const body = await req.json();

    const { patientId, doctorId, appointmentDate, startTime, endTime, type, notes } = body;

    // 1. Required fields check
    if (!patientId || !appointmentDate || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields: Patient, Date, Start Time, and End Time are mandatory.' }, { status: 400 });
    }

    // 2. Validate Type enum
    const validTypes = ['CONSULTATION', 'FOLLOW_UP', 'SURGERY', 'REVIEW'];
    const appointmentType = type && validTypes.includes(type) ? type : 'CONSULTATION';

    // 3. Date validation - Past date check
    const todayStr = new Date().toISOString().split('T')[0];
    if (appointmentDate < todayStr) {
      return NextResponse.json({ error: 'Appointment date cannot be in the past.' }, { status: 400 });
    }

    // 4. Time validation - Working hours (09:00 AM - 07:00 PM) & Start/End time logic
    const WORK_START = '09:00';
    const WORK_END = '19:00';

    if (startTime < WORK_START || startTime > WORK_END) {
      return NextResponse.json({ error: 'Start time must be within clinic working hours (09:00 AM to 07:00 PM).' }, { status: 400 });
    }

    if (endTime < WORK_START || endTime > WORK_END) {
      return NextResponse.json({ error: 'End time must be within clinic working hours (09:00 AM to 07:00 PM).' }, { status: 400 });
    }

    if (startTime >= endTime) {
      return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 });
    }

    // Minimum 15-minute slot duration check
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const durationMinutes = (eH * 60 + eM) - (sH * 60 + sM);
    if (isNaN(durationMinutes) || durationMinutes < 15) {
      return NextResponse.json({ error: 'Appointment slot duration must be at least 15 minutes.' }, { status: 400 });
    }

    // Past time check if scheduled for today
    if (appointmentDate === todayStr) {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentHHMM > WORK_END) {
        return NextResponse.json({ error: 'Clinic working hours for today (09:00 AM - 07:00 PM) have already ended. Please select a future date.' }, { status: 400 });
      }
      if (startTime < currentHHMM) {
        return NextResponse.json({ error: 'Start time cannot be in the past for today\'s date.' }, { status: 400 });
      }
    }

    // 5. Patient existence check
    const patientExists = await Patient.findOne({ where: { id: patientId, clinicId } });
    if (!patientExists) {
      return NextResponse.json({ error: 'Selected patient does not exist or belong to this clinic.' }, { status: 400 });
    }

    // 6. Doctor existence check if provided
    if (doctorId) {
      const doctorExists = await User.findOne({ where: { id: doctorId, clinicId } });
      if (!doctorExists) {
        return NextResponse.json({ error: 'Selected doctor does not exist or belong to this clinic.' }, { status: 400 });
      }
    }

    // 7. Time Slot Conflict / Overlap Detection
    const existingAppointments = await Appointment.findAll({
      where: {
        clinicId,
        appointmentDate,
        status: { [Op.ne]: 'CANCELLED' },
      },
    });

    const isOverlapping = (startA: string, endA: string, startB: string, endB: string) => {
      return startA < endB && endA > startB;
    };

    // Check Doctor conflict
    if (doctorId) {
      const doctorConflict = existingAppointments.find(
        (app) => app.doctorId === doctorId && isOverlapping(startTime, endTime, app.startTime, app.endTime)
      );
      if (doctorConflict) {
        return NextResponse.json(
          { error: `Selected doctor is already booked for an appointment between ${doctorConflict.startTime} and ${doctorConflict.endTime}.` },
          { status: 400 }
        );
      }
    }

    // Check Patient conflict
    const patientConflict = existingAppointments.find(
      (app) => app.patientId === patientId && isOverlapping(startTime, endTime, app.startTime, app.endTime)
    );
    if (patientConflict) {
      return NextResponse.json(
        { error: `Selected patient already has an appointment scheduled between ${patientConflict.startTime} and ${patientConflict.endTime}.` },
        { status: 400 }
      );
    }

    // Create Appointment
    const appointment = await Appointment.create({
      clinicId,
      patientId,
      doctorId: doctorId || null,
      appointmentDate,
      startTime,
      endTime,
      type: appointmentType,
      notes: notes || '',
      status: 'SCHEDULED',
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create appointment' }, { status: 500 });
  }
}

