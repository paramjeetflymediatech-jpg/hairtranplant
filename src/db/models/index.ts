import sequelize from '../index';
import Clinic from './Clinic';
import User from './User';
import Patient from './Patient';
import Lead from './Lead';
import Appointment from './Appointment';
import Consultation from './Consultation';
import HairAnalysis from './HairAnalysis';
import TreatmentPlan from './TreatmentPlan';
import Surgery from './Surgery';
import SurgeryGraft from './SurgeryGraft';
import PatientPhoto from './PatientPhoto';
import FollowUp from './FollowUp';
import Payment from './Payment';
import Subscription from './Subscription';

// Establish Associations
Clinic.hasMany(User, { foreignKey: 'clinicId', as: 'users' });
User.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasMany(Patient, { foreignKey: 'clinicId', as: 'patients' });
Patient.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasMany(Lead, { foreignKey: 'clinicId', as: 'leads' });
Lead.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasMany(Appointment, { foreignKey: 'clinicId', as: 'appointments' });
Appointment.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasMany(Surgery, { foreignKey: 'clinicId', as: 'surgeries' });
Surgery.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasOne(Subscription, { foreignKey: 'clinicId', as: 'subscription' });
Subscription.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

// Patient relationships
Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(Consultation, { foreignKey: 'patientId', as: 'consultations' });
Consultation.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(HairAnalysis, { foreignKey: 'patientId', as: 'hairAnalyses' });
HairAnalysis.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(TreatmentPlan, { foreignKey: 'patientId', as: 'treatmentPlans' });
TreatmentPlan.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(Surgery, { foreignKey: 'patientId', as: 'surgeries' });
Surgery.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(PatientPhoto, { foreignKey: 'patientId', as: 'photos' });
PatientPhoto.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(FollowUp, { foreignKey: 'patientId', as: 'followUps' });
FollowUp.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(Payment, { foreignKey: 'patientId', as: 'payments' });
Payment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// Surgery & Grafts
Surgery.hasMany(SurgeryGraft, { foreignKey: 'surgeryId', as: 'grafts' });
SurgeryGraft.belongsTo(Surgery, { foreignKey: 'surgeryId', as: 'surgery' });

Surgery.hasMany(FollowUp, { foreignKey: 'surgeryId', as: 'followUps' });
FollowUp.belongsTo(Surgery, { foreignKey: 'surgeryId', as: 'surgery' });

// Doctor (User) relationships
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

User.hasMany(Surgery, { foreignKey: 'doctorId', as: 'doctorSurgeries' });
Surgery.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

export {
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
};
