import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type AppointmentType = 'CONSULTATION' | 'FOLLOW_UP' | 'SURGERY' | 'REVIEW';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface AppointmentAttributes {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AppointmentCreationAttributes = Optional<AppointmentAttributes, 'id' | 'status'>;

export class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public id!: string;
  public clinicId!: string;
  public patientId!: string;
  public doctorId?: string;
  public appointmentDate!: string;
  public startTime!: string;
  public endTime!: string;
  public type!: AppointmentType;
  public status!: AppointmentStatus;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
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
    sequelize,
    tableName: 'appointments',
    timestamps: true,
  }
);

export default Appointment;
