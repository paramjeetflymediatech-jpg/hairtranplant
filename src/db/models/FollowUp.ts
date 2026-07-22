import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type FollowUpType = 'DAY_1' | 'DAY_7' | 'DAY_15' | 'MONTH_1' | 'MONTH_3' | 'MONTH_6' | 'MONTH_9' | 'MONTH_12';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SKIPPED';

export interface FollowUpAttributes {
  id: string;
  clinicId: string;
  patientId: string;
  surgeryId?: string;
  followUpDate: string; // YYYY-MM-DD
  type: FollowUpType;
  status: FollowUpStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FollowUpCreationAttributes = Optional<FollowUpAttributes, 'id' | 'status'>;

export class FollowUp extends Model<FollowUpAttributes, FollowUpCreationAttributes> implements FollowUpAttributes {
  public id!: string;
  public clinicId!: string;
  public patientId!: string;
  public surgeryId?: string;
  public followUpDate!: string;
  public type!: FollowUpType;
  public status!: FollowUpStatus;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FollowUp.init(
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
    surgeryId: DataTypes.UUID,
    followUpDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('DAY_1', 'DAY_7', 'DAY_15', 'MONTH_1', 'MONTH_3', 'MONTH_6', 'MONTH_9', 'MONTH_12'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'OVERDUE', 'SKIPPED'),
      defaultValue: 'PENDING',
    },
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    tableName: 'follow_ups',
    timestamps: true,
  }
);

export default FollowUp;
