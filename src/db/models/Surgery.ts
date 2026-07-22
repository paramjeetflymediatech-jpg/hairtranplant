import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';
import { ProcedureType } from './TreatmentPlan';

export type SurgeryStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SurgeryAttributes {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  procedure: ProcedureType;
  surgeryDate: string; // YYYY-MM-DD
  plannedGrafts: number;
  extractedGrafts: number;
  implantedGrafts: number;
  surgeryDuration?: string; // e.g. "6h 30m"
  status: SurgeryStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SurgeryCreationAttributes = Optional<SurgeryAttributes, 'id' | 'extractedGrafts' | 'implantedGrafts' | 'status'>;

export class Surgery extends Model<SurgeryAttributes, SurgeryCreationAttributes> implements SurgeryAttributes {
  public id!: string;
  public clinicId!: string;
  public patientId!: string;
  public doctorId?: string;
  public procedure!: ProcedureType;
  public surgeryDate!: string;
  public plannedGrafts!: number;
  public extractedGrafts!: number;
  public implantedGrafts!: number;
  public surgeryDuration?: string;
  public status!: SurgeryStatus;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Surgery.init(
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
    procedure: {
      type: DataTypes.ENUM('FUE', 'FUT', 'DHI', 'COMBINATION'),
      defaultValue: 'FUE',
    },
    surgeryDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plannedGrafts: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    extractedGrafts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    implantedGrafts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    surgeryDuration: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'SCHEDULED',
    },
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    tableName: 'surgeries',
    timestamps: true,
  }
);

export default Surgery;
