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

export class Consultation extends Model<ConsultationAttributes, ConsultationCreationAttributes> implements ConsultationAttributes {
  public id!: string;
  public clinicId!: string;
  public patientId!: string;
  public doctorId?: string;
  public consultationDate!: string;
  public hairLossStage?: string;
  public diagnosisNotes?: string;
  public recommendations?: string;
  public estimatedGrafts?: number;
  public recommendedProcedure?: 'FUE' | 'FUT' | 'DHI' | 'COMBINATION';
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Consultation.init(
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
    sequelize,
    tableName: 'consultations',
    timestamps: true,
  }
);

export default Consultation;
