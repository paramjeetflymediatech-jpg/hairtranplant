import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export interface HairAnalysisAttributes {
  id: string;
  clinicId: string;
  patientId: string;
  frontPhoto?: string;
  topPhoto?: string;
  leftPhoto?: string;
  rightPhoto?: string;
  backPhoto?: string;
  hairLossStage?: string;
  hairDensity?: string; // e.g. "65 grafts/cm²"
  donorAreaQuality?: string; // e.g. "Excellent (85/100)"
  estimatedMinGrafts?: number;
  estimatedMaxGrafts?: number;
  aiAnalysis?: string; // JSON string with detailed breakdown & confidence
  doctorVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type HairAnalysisCreationAttributes = Optional<HairAnalysisAttributes, 'id' | 'doctorVerified'>;

export class HairAnalysis extends Model<HairAnalysisAttributes, HairAnalysisCreationAttributes> implements HairAnalysisAttributes {
  public id!: string;
  public clinicId!: string;
  public patientId!: string;
  public frontPhoto?: string;
  public topPhoto?: string;
  public leftPhoto?: string;
  public rightPhoto?: string;
  public backPhoto?: string;
  public hairLossStage?: string;
  public hairDensity?: string;
  public donorAreaQuality?: string;
  public estimatedMinGrafts?: number;
  public estimatedMaxGrafts?: number;
  public aiAnalysis?: string;
  public doctorVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HairAnalysis.init(
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
    frontPhoto: DataTypes.TEXT,
    topPhoto: DataTypes.TEXT,
    leftPhoto: DataTypes.TEXT,
    rightPhoto: DataTypes.TEXT,
    backPhoto: DataTypes.TEXT,
    hairLossStage: DataTypes.STRING,
    hairDensity: DataTypes.STRING,
    donorAreaQuality: DataTypes.STRING,
    estimatedMinGrafts: DataTypes.INTEGER,
    estimatedMaxGrafts: DataTypes.INTEGER,
    aiAnalysis: DataTypes.TEXT,
    doctorVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'hair_analyses',
    timestamps: true,
  }
);

export default HairAnalysis;
