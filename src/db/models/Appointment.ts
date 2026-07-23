import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type AppointmentType = 'CONSULTATION' | 'FOLLOW_UP' | 'SURGERY' | 'REVIEW';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface AppointmentAttributes {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AppointmentCreationAttributes = Optional<AppointmentAttributes, 'id' | 'status'>;

export interface AppointmentInstance extends Model<AppointmentAttributes, AppointmentCreationAttributes>, AppointmentAttributes {}

export const Appointment = sequelize.define<AppointmentInstance>(
  'Appointment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => Math.random().toString(36).substring(2) + Date.now().toString(36),
      primaryKey: true,
    },
    clinicId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    doctorId: DataTypes.UUID,
    appointmentDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('CONSULTATION', 'FOLLOW_UP', 'SURGERY', 'REVIEW'),
      defaultValue: 'CONSULTATION',
    },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
      defaultValue: 'SCHEDULED',
    },
    notes: DataTypes.TEXT,
  },
  {
    tableName: 'appointments',
    timestamps: true,
  }
);

export default Appointment;
