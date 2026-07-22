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
  hairLossStage?: string; // e.g. "Norwood IV", "Norwood V"
  source?: string; // e.g. "Instagram", "Google Ads", "Referral"
  status: 'LEAD' | 'CONSULTATION' | 'SCHEDULED' | 'POST_OP' | 'COMPLETED' | 'INACTIVE';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PatientCreationAttributes = Optional<PatientAttributes, 'id' | 'status'>;

export class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: string;
  public clinicId!: string;
  public name!: string;
  public email?: string;
  public phone?: string;
  public dateOfBirth?: string;
  public gender?: string;
  public profilePhoto?: string;
  public hairLossStage?: string;
  public source?: string;
  public status!: 'LEAD' | 'CONSULTATION' | 'SCHEDULED' | 'POST_OP' | 'COMPLETED' | 'INACTIVE';
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
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
    sequelize,
    tableName: 'patients',
    timestamps: true,
  }
);

export default Patient;
