import {
  sequelize,
  Clinic,
  User,
  Patient,
  Lead,
  Appointment,
  Consultation,
  HairAnalysis,
  TreatmentPlan,
  Surgery,
  SurgeryGraft,
  PatientPhoto,
  FollowUp,
  Payment,
  Subscription,
} from './models';
import { hashPassword } from '../lib/auth';

export async function seedDatabase() {
  await sequelize.sync({ force: true });
  console.log('🌱 Database synced. Seeding initial GraftDesk data...');

  const hashedPassword = await hashPassword('password123');

  // 1. Super Admin
  const superAdmin = await User.create({
    name: 'GraftDesk Platform Owner',
    email: 'superadmin@graftdesk.com',
    password: hashedPassword,
    role: 'SUPER_ADMIN',
    isActive: true,
  });

  // 2. Clinics
  const clinicApex = await Clinic.create({
    name: 'Apex Hair Institute',
    slug: 'apex-hair',
    email: 'contact@apexhair.com',
    phone: '+1 (555) 234-5678',
    logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300&auto=format&fit=crop&q=80',
    backgroundImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&auto=format&fit=crop&q=80',
    themeColor: '#0d9488',
    address: '450 Beverly Hills Medical Plaza, Suite 400',
    city: 'Beverly Hills',
    state: 'CA',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    subscriptionPlan: 'PROFESSIONAL',
    subscriptionStatus: 'ACTIVE',
  });

  const clinicASG = await Clinic.create({
    name: 'ASG Hair Transplant Clinic',
    slug: 'asg-hair',
    email: 'info@asghairtransplant.com',
    phone: '+91 95015 54888',
    logo: 'https://asghairtransplant.com/wp-content/uploads/2021/04/asg-logo.png',
    backgroundImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80',
    themeColor: '#f59e0b',
    address: '6-A, Lajpat Nagar, Link Road',
    city: 'Jalandhar',
    state: 'Punjab',
    country: 'India',
    timezone: 'Asia/Kolkata',
    subscriptionPlan: 'ENTERPRISE',
    subscriptionStatus: 'ACTIVE',
  });

  const clinicHarley = await Clinic.create({
    name: 'Harley Street Restoration',
    slug: 'harley-street',
    email: 'info@harleystreethair.co.uk',
    phone: '+44 20 7946 0912',
    backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
    themeColor: '#eab308',
    address: '10 Harley Street',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    subscriptionPlan: 'ENTERPRISE',
    subscriptionStatus: 'ACTIVE',
  });

  // 3. Subscriptions
  await Subscription.create({
    clinicId: clinicApex.id,
    plan: 'PROFESSIONAL',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    billingCycle: 'ANNUAL',
    amount: 299.00,
  });

  await Subscription.create({
    clinicId: clinicASG.id,
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    billingCycle: 'ANNUAL',
    amount: 599.00,
  });
  await Subscription.create({
    clinicId: clinicHarley.id,
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    startDate: '2026-02-15',
    endDate: '2027-02-15',
    billingCycle: 'ANNUAL',
    amount: 599.00,
  });

  // 4. Clinic Staff
  // ASG Staff
  const clinicAdminASG = await User.create({
    clinicId: clinicASG.id,
    name: 'Dr. A.S. Galloway',
    email: 'admin@asghairtransplant.com',
    password: hashedPassword,
    role: 'CLINIC_ADMIN',
    phone: '+91 95015 54888',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  });

  const doctorASG = await User.create({
    clinicId: clinicASG.id,
    name: 'Dr. Gurtej Singh, MS',
    email: 'dr.singh@asghairtransplant.com',
    password: hashedPassword,
    role: 'DOCTOR',
    phone: '+91 95015 54889',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  });

  const clinicAdmin = await User.create({
    clinicId: clinicApex.id,
    name: 'Elena Rostova',
    email: 'admin@apexhair.com',
    password: hashedPassword,
    role: 'CLINIC_ADMIN',
    phone: '+1 555-0192',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  });

  const doctor = await User.create({
    clinicId: clinicApex.id,
    name: 'Dr. Alexander Vance, MD',
    email: 'dr.smith@apexhair.com',
    password: hashedPassword,
    role: 'DOCTOR',
    phone: '+1 555-0193',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  });

  const consultant = await User.create({
    clinicId: clinicApex.id,
    name: 'Sarah Jenkins',
    email: 'sarah.consultant@apexhair.com',
    password: hashedPassword,
    role: 'CONSULTANT',
    phone: '+1 555-0194',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  });

  const receptionist = await User.create({
    clinicId: clinicApex.id,
    name: 'Marcus Brody',
    email: 'reception@apexhair.com',
    password: hashedPassword,
    role: 'RECEPTIONIST',
    phone: '+1 555-0195',
    isActive: true,
  });

  // 5. Patients & Patient User Account
  const patientMichael = await Patient.create({
    clinicId: clinicApex.id,
    name: 'Michael Vance',
    email: 'michael.patient@gmail.com',
    phone: '+1 (555) 789-0123',
    dateOfBirth: '1988-06-14',
    gender: 'Male',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    hairLossStage: 'Norwood IV',
    source: 'Instagram Ads',
    status: 'POST_OP',
    notes: 'Prioritized dense temporal peak reconstruction. Very compliant post-op patient.',
  });

  const patientUser = await User.create({
    clinicId: clinicApex.id,
    name: 'Michael Vance',
    email: 'michael.patient@gmail.com',
    password: hashedPassword,
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  });

  const patientDavid = await Patient.create({
    clinicId: clinicApex.id,
    name: 'David Miller',
    email: 'david.m@outlook.com',
    phone: '+1 (555) 345-6789',
    dateOfBirth: '1992-11-20',
    gender: 'Male',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    hairLossStage: 'Norwood III Vertex',
    source: 'Google Ads',
    status: 'SCHEDULED',
    notes: 'Booked FUE 2,800 grafts for next month.',
  });

  const patientMarcus = await Patient.create({
    clinicId: clinicApex.id,
    name: 'Marcus Chen',
    email: 'marcus.chen@techcorp.com',
    phone: '+1 (555) 901-2345',
    dateOfBirth: '1985-03-08',
    gender: 'Male',
    hairLossStage: 'Norwood V',
    source: 'Referral',
    status: 'CONSULTATION',
    notes: 'Interested in DHI procedure with PRP therapy.',
  });

  // 6. Leads
  await Lead.create({
    clinicId: clinicApex.id,
    name: 'Arthur Pendelton',
    email: 'arthur.p@gmail.com',
    phone: '+1 (555) 444-1122',
    source: 'Google Ads',
    status: 'NEW',
    assignedTo: consultant.id,
    estimatedValue: 6500,
    notes: 'Requested online photo evaluation via website contact form.',
  });

  await Lead.create({
    clinicId: clinicApex.id,
    name: 'Julian Thorne',
    email: 'j.thorne@biotech.io',
    phone: '+1 (555) 333-8899',
    source: 'Instagram Ads',
    status: 'CONTACTED',
    assignedTo: consultant.id,
    estimatedValue: 7200,
    notes: 'Spoke on phone, sent pre-consultation medical questionnaire.',
  });

  await Lead.create({
    clinicId: clinicApex.id,
    name: 'Brandon Walsh',
    email: 'brandon@walshcapital.com',
    phone: '+1 (555) 888-2233',
    source: 'Referral',
    status: 'CONSULTATION_BOOKED',
    assignedTo: consultant.id,
    estimatedValue: 8500,
    notes: 'In-clinic consultation scheduled for Friday 10:00 AM.',
  });

  await Lead.create({
    clinicId: clinicApex.id,
    name: 'David Miller',
    email: 'david.m@outlook.com',
    phone: '+1 (555) 345-6789',
    source: 'Google Ads',
    status: 'SURGERY_BOOKED',
    assignedTo: consultant.id,
    estimatedValue: 7800,
    notes: 'Deposit paid $2,000. Surgery scheduled.',
  });

  await Lead.create({
    clinicId: clinicApex.id,
    name: 'Michael Vance',
    email: 'michael.patient@gmail.com',
    phone: '+1 (555) 789-0123',
    source: 'Instagram Ads',
    status: 'CONVERTED',
    assignedTo: consultant.id,
    estimatedValue: 8200,
    notes: 'FUE 3,100 Grafts completed successfully.',
  });

  // 7. Appointments
  await Appointment.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    doctorId: doctor.id,
    appointmentDate: '2026-07-22',
    startTime: '10:00',
    endTime: '11:00',
    type: 'FOLLOW_UP',
    status: 'SCHEDULED',
    notes: '6-Month Post-Op Progress Check & Photo Recording.',
  });

  await Appointment.create({
    clinicId: clinicApex.id,
    patientId: patientDavid.id,
    doctorId: doctor.id,
    appointmentDate: '2026-07-22',
    startTime: '14:00',
    endTime: '15:30',
    type: 'CONSULTATION',
    status: 'SCHEDULED',
    notes: 'Pre-surgery design review & hairline mapping.',
  });

  await Appointment.create({
    clinicId: clinicApex.id,
    patientId: patientMarcus.id,
    doctorId: doctor.id,
    appointmentDate: '2026-07-23',
    startTime: '11:30',
    endTime: '12:30',
    type: 'CONSULTATION',
    status: 'SCHEDULED',
    notes: 'Norwood V scalp density analysis.',
  });

  // 8. Consultations & AI Hair Analysis
  await Consultation.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    doctorId: doctor.id,
    consultationDate: '2026-01-10',
    hairLossStage: 'Norwood IV',
    diagnosisNotes: 'Significant bitemporal recessions with mid-scalp thinning.',
    recommendations: 'FUE 3,100 Grafts targeting frontal hairline and vertex blending.',
    estimatedGrafts: 3100,
    recommendedProcedure: 'FUE',
    notes: 'Patient responded very favorably to graft density expectations.',
  });

  await HairAnalysis.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    frontPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    topPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    hairLossStage: 'Norwood IV',
    hairDensity: '68 grafts/cm²',
    donorAreaQuality: 'Excellent (90/100)',
    estimatedMinGrafts: 2900,
    estimatedMaxGrafts: 3300,
    aiAnalysis: JSON.stringify({
      frontalRecession: 'Grade 3 Temporal',
      donorSupplyEst: '6,500 total available grafts',
      confidence: 95.4,
    }),
    doctorVerified: true,
  });

  // 9. Treatment Plan & Surgery
  const treatmentPlan = await TreatmentPlan.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    doctorId: doctor.id,
    procedure: 'FUE',
    estimatedGrafts: 3100,
    estimatedCost: 8200.00,
    description: 'Motorized Sapphire FUE 3,100 grafts with PRP plasma scalp treatment.',
    status: 'COMPLETED',
  });

  const surgery = await Surgery.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    doctorId: doctor.id,
    procedure: 'FUE',
    surgeryDate: '2026-01-20',
    plannedGrafts: 3100,
    extractedGrafts: 3150,
    implantedGrafts: 3120,
    surgeryDuration: '6h 45m',
    status: 'COMPLETED',
    notes: 'Sapphire blade channel creation. Excellent donor elasticity and minimal transection rate (< 1.5%).',
  });

  // 10. Surgery Grafts Breakdown
  await SurgeryGraft.create({
    surgeryId: surgery.id,
    graftType: 'SINGLE',
    quantity: 650,
    notes: 'Placed exclusively at the ultra-fine frontal hairline boundary.',
  });

  await SurgeryGraft.create({
    surgeryId: surgery.id,
    graftType: 'DOUBLE',
    quantity: 1450,
    notes: 'Placed in mid-hairline transitions.',
  });

  await SurgeryGraft.create({
    surgeryId: surgery.id,
    graftType: 'TRIPLE',
    quantity: 820,
    notes: 'Denser core mid-scalp region.',
  });

  await SurgeryGraft.create({
    surgeryId: surgery.id,
    graftType: 'MULTI',
    quantity: 200,
    notes: 'Vertex density reinforcement.',
  });

  // 11. Patient Progress Photos
  await PatientPhoto.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    type: 'BEFORE',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    capturedAt: '2026-01-20',
    notes: 'Pre-op marked scalp hairline design.',
    isPublicConsent: true,
  });

  await PatientPhoto.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    type: 'DAY_1',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    capturedAt: '2026-01-21',
    notes: 'Post-op Day 1 graft inspection. Clean scabbing, zero edema.',
    isPublicConsent: true,
  });

  await PatientPhoto.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    type: 'MONTH_3',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    capturedAt: '2026-04-20',
    notes: 'Shedding phase complete, early anagen growth sprouting.',
    isPublicConsent: true,
  });

  await PatientPhoto.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    type: 'MONTH_6',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    capturedAt: '2026-07-20',
    notes: 'Robust 65% density maturation achieved!',
    isPublicConsent: true,
  });

  // 12. Follow-Ups
  await FollowUp.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    surgeryId: surgery.id,
    followUpDate: '2026-01-21',
    type: 'DAY_1',
    status: 'COMPLETED',
    notes: 'Bandage removal and initial saline wash instruction.',
  });

  await FollowUp.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    surgeryId: surgery.id,
    followUpDate: '2026-01-27',
    type: 'DAY_7',
    status: 'COMPLETED',
    notes: 'Scab removal bath protocol executed.',
  });

  await FollowUp.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    surgeryId: surgery.id,
    followUpDate: '2026-02-20',
    type: 'MONTH_1',
    status: 'COMPLETED',
    notes: 'Shock loss guidance provided.',
  });

  await FollowUp.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    surgeryId: surgery.id,
    followUpDate: '2026-07-22',
    type: 'MONTH_6',
    status: 'PENDING',
    notes: 'Upcoming 6-Month post-op photo evaluation.',
  });

  // 13. Payments
  await Payment.create({
    clinicId: clinicApex.id,
    patientId: patientMichael.id,
    treatmentPlanId: treatmentPlan.id,
    amount: 8200.00,
    currency: 'USD',
    status: 'COMPLETED',
    paymentMethod: 'CREDIT_CARD',
    transactionId: 'TXN_APEX_88921',
  });

  console.log('✅ GraftDesk database seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
