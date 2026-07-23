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
  surgeryDate: string;
  plannedGrafts: number;
  extractedGrafts: number;
  implantedGrafts: number;
  surgeryDuration?: string;
  status: SurgeryStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SurgeryCreationAttributes = Optional<SurgeryAttributes, 'id' | 'extractedGrafts' | 'implantedGrafts' | 'status'>;

export interface SurgeryInstance extends Model<SurgeryAttributes, SurgeryCreationAttributes>, SurgeryAttributes {}

export const Surgery = sequelize.define<SurgeryInstance>(
  'Surgery',
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
    tableName: 'surgeries',
    timestamps: true,
  }
);

export default Surgery;
