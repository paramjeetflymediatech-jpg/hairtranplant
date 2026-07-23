import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CONSULTATION_BOOKED'
  | 'CONSULTATION_COMPLETED'
  | 'TREATMENT_RECOMMENDED'
  | 'SURGERY_BOOKED'
  | 'CONVERTED'
  | 'LOST';

export interface LeadAttributes {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  assignedTo?: string;
  estimatedValue?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LeadCreationAttributes = Optional<LeadAttributes, 'id' | 'status'>;

export interface LeadInstance extends Model<LeadAttributes, LeadCreationAttributes>, LeadAttributes {}

export const Lead = sequelize.define<LeadInstance>(
  'Lead',
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
    source: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM(
        'NEW',
        'CONTACTED',
        'CONSULTATION_BOOKED',
        'CONSULTATION_COMPLETED',
        'TREATMENT_RECOMMENDED',
        'SURGERY_BOOKED',
        'CONVERTED',
        'LOST'
      ),
      defaultValue: 'NEW',
    },
    assignedTo: DataTypes.UUID,
    estimatedValue: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    notes: DataTypes.TEXT,
  },
  {
    tableName: 'leads',
    timestamps: true,
  }
);

export default Lead;
