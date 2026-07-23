import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export interface PatientAttributes {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePhoto?: string;
  hairLossStage?: string;
  source?: string;
  status: 'LEAD' | 'CONSULTATION' | 'SCHEDULED' | 'POST_OP' | 'COMPLETED' | 'INACTIVE';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PatientCreationAttributes = Optional<PatientAttributes, 'id' | 'status'>;

export interface PatientInstance extends Model<PatientAttributes, PatientCreationAttributes>, PatientAttributes {}

export const Patient = sequelize.define<PatientInstance>(
  'Patient',
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    dateOfBirth: DataTypes.STRING,
    gender: DataTypes.STRING,
    profilePhoto: DataTypes.TEXT,
    hairLossStage: DataTypes.STRING,
    source: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('LEAD', 'CONSULTATION', 'SCHEDULED', 'POST_OP', 'COMPLETED', 'INACTIVE'),
      defaultValue: 'CONSULTATION',
    },
    notes: DataTypes.TEXT,
  },
  {
    tableName: 'patients',
    timestamps: true,
  }
);

export default Patient;
