import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type ProcedureType = 'FUE' | 'FUT' | 'DHI' | 'COMBINATION';
export type TreatmentPlanStatus = 'PROPOSED' | 'ACCEPTED' | 'SCHEDULED' | 'COMPLETED' | 'DECLINED';

export interface TreatmentPlanAttributes {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  procedure: ProcedureType;
  estimatedGrafts: number;
  estimatedCost: number;
  description?: string;
  status: TreatmentPlanStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TreatmentPlanCreationAttributes = Optional<TreatmentPlanAttributes, 'id' | 'status'>;

export interface TreatmentPlanInstance extends Model<TreatmentPlanAttributes, TreatmentPlanCreationAttributes>, TreatmentPlanAttributes {}

export const TreatmentPlan = sequelize.define<TreatmentPlanInstance>(
  'TreatmentPlan',
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
    estimatedGrafts: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('PROPOSED', 'ACCEPTED', 'SCHEDULED', 'COMPLETED', 'DECLINED'),
      defaultValue: 'PROPOSED',
    },
  },
  {
    tableName: 'treatment_plans',
    timestamps: true,
  }
);

export default TreatmentPlan;
