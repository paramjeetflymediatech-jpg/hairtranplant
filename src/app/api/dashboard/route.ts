import { NextRequest, NextResponse } from 'next/server';
import { Patient, Lead, Appointment, Surgery, Payment, FollowUp, User } from '@/db/models';
import { getSessionUser } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayDateString = now.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];

    // 1. Total Active Patients
    const totalPatients = await Patient.count({ where: { clinicId } });

    // 2. New Leads (This Month)
    const newLeadsCount = await Lead.count({
      where: {
        clinicId,
        createdAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // 3. Today's Appointments count
    const todayAppointmentsCount = await Appointment.count({
      where: {
        clinicId,
        appointmentDate: todayDateString,
      },
    });

    // 4. Upcoming Surgeries count
    const upcomingSurgeriesCount = await Surgery.count({
      where: {
        clinicId,
        status: 'SCHEDULED',
      },
    });

    // 5. Lead Conversion Rate
    const totalLeads = await Lead.count({ where: { clinicId } });
    const convertedLeads = await Lead.count({ where: { clinicId, status: 'CONVERTED' } });
    const leadConversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

    // Conversion Funnel Metrics
    const totalLeadsFunnel = await Lead.count({ where: { clinicId } });
    const consultationBookedCount = await Lead.count({
      where: {
        clinicId,
        status: {
          [Op.in]: ['CONSULTATION_BOOKED', 'CONSULTATION_COMPLETED', 'TREATMENT_RECOMMENDED', 'SURGERY_BOOKED', 'CONVERTED'],
        },
      },
    });
    const treatmentRecommendedCount = await Lead.count({
      where: {
        clinicId,
        status: {
          [Op.in]: ['TREATMENT_RECOMMENDED', 'SURGERY_BOOKED', 'CONVERTED'],
        },
      },
    });
    const convertedCount = await Lead.count({
      where: {
        clinicId,
        status: {
          [Op.in]: ['SURGERY_BOOKED', 'CONVERTED'],
        },
      },
    });

    // 6. Monthly Revenue
    const monthlyPayments = await Payment.findAll({
      where: {
        clinicId,
        status: 'COMPLETED',
        createdAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // 7. Today's Appointment Schedule List
    const appointmentsList = await Appointment.findAll({
      where: {
        clinicId,
        appointmentDate: todayDateString,
      },
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['startTime', 'ASC']],
    });

    // Fetch matching surgeries for today to get procedure details
    const todaySurgeries = await Surgery.findAll({
      where: {
        clinicId,
        surgeryDate: todayDateString,
      },
    });

    const formattedAppointments = appointmentsList.map((app) => {
      let procedure = app.notes || 'Clinic Consultation';
      if (app.type === 'SURGERY') {
        const matchingSurgery = todaySurgeries.find((s) => s.patientId === app.patientId);
        procedure = matchingSurgery
          ? `${matchingSurgery.procedure} ${matchingSurgery.plannedGrafts.toLocaleString()} Grafts`
          : 'FUE Hair Transplant Surgery';
      } else if (app.type === 'FOLLOW_UP') {
        procedure = app.notes || 'Post-Op Follow-Up';
      } else if (app.type === 'REVIEW') {
        procedure = app.notes || 'Hairline Design Review';
      }

      // Format time representation (e.g., convert "09:00" to "09:00 AM")
      let timeStr = app.startTime;
      try {
        const [hours, minutes] = app.startTime.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHours = h % 12 || 12;
        timeStr = `${formattedHours}:${minutes} ${ampm}`;
      } catch (err) {
        // Fallback to original
      }

      return {
        id: app.id,
        time: timeStr,
        patient: (app as any).patient?.name || 'Unknown Patient',
        patientId: (app as any).patient?.id,
        type: app.type,
        procedure,
        doctor: (app as any).doctor?.name || 'Assigned Staff Member',
        status: app.status,
      };
    });

    // 8. Post-Op Follow-Up Queue Alerts
    const followUpsList = await FollowUp.findAll({
      where: {
        clinicId,
        status: 'PENDING',
      },
      include: [{ model: Patient, as: 'patient' }],
      order: [['followUpDate', 'ASC']],
      limit: 5,
    });

    const formattedFollowUps = followUpsList.map((item) => {
      let dateLabel = item.followUpDate;
      if (item.followUpDate === todayDateString) dateLabel = 'Today';
      else if (item.followUpDate === tomorrowDateString) dateLabel = 'Tomorrow';

      return {
        id: item.id,
        patient: (item as any).patient?.name || 'Unknown Patient',
        patientId: (item as any).patient?.id,
        type: item.type === 'MONTH_1' ? 'Month 1 Shock Loss Check' : item.type === 'MONTH_6' ? 'Month 6 Photo Upload' : 'Day 15 Scab Washing',
        date: dateLabel,
        status: item.status,
      };
    });

    // 9. Last 6 Months Chart Data
    const chartData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const mStart = new Date(year, monthIdx, 1);
      const mEnd = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);

      const mStartStr = mStart.toISOString().split('T')[0];
      const mEndStr = mEnd.toISOString().split('T')[0];

      // Leads created in this month
      const monthLeads = await Lead.count({
        where: {
          clinicId,
          createdAt: { [Op.between]: [mStart, mEnd] },
        },
      });

      // Completed surgeries in this month (sum implanted grafts)
      const monthSurgeries = await Surgery.findAll({
        where: {
          clinicId,
          status: 'COMPLETED',
          surgeryDate: { [Op.between]: [mStartStr, mEndStr] },
        },
      });
      const monthGrafts = monthSurgeries.reduce((sum, s) => sum + (s.implantedGrafts || s.plannedGrafts || 0), 0);

      // Payments received in this month (sum amount)
      const monthPayments = await Payment.findAll({
        where: {
          clinicId,
          status: 'COMPLETED',
          createdAt: { [Op.between]: [mStart, mEnd] },
        },
      });
      const monthRevenue = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      chartData.push({
        month: monthNames[monthIdx],
        grafts: monthGrafts,
        revenue: monthRevenue,
        leads: monthLeads,
      });
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalPatients,
        newLeadsCount,
        todayAppointmentsCount,
        upcomingSurgeriesCount,
        leadConversionRate,
        monthlyRevenue,
      },
      funnel: {
        totalLeads: totalLeadsFunnel,
        consultationBooked: consultationBookedCount,
        treatmentRecommended: treatmentRecommendedCount,
        converted: convertedCount,
      },
      appointments: formattedAppointments,
      followUps: formattedFollowUps,
      chartData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
