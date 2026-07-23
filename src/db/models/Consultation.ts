import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export interface ConsultationAttributes {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  consultationDate: string;
  hairLossStage?: string;
  diagnosisNotes?: string;
  recommendations?: string;
  estimatedGrafts?: number;
  recommendedProcedure?: 'FUE' | 'FUT' | 'DHI' | 'COMBINATION';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ConsultationCreationAttributes = Optional<ConsultationAttributes, 'id'>;

export interface ConsultationInstance extends Model<ConsultationAttributes, ConsultationCreationAttributes>, ConsultationAttributes {}

export const Consultation = sequelize.define<ConsultationInstance>(
  'Consultation',
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
    consultationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hairLossStage: DataTypes.STRING,
    diagnosisNotes: DataTypes.TEXT,
    recommendations: DataTypes.TEXT,
    estimatedGrafts: DataTypes.INTEGER,
    recommendedProcedure: DataTypes.ENUM('FUE', 'FUT', 'DHI', 'COMBINATION'),
    notes: DataTypes.TEXT,
  },
  {
    tableName: 'consultations',
    timestamps: true,
  }
);

export default Consultation;
