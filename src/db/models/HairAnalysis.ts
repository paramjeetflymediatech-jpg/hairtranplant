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
  hairDensity?: string;
  donorAreaQuality?: string;
  estimatedMinGrafts?: number;
  estimatedMaxGrafts?: number;
  aiAnalysis?: string;
  doctorVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type HairAnalysisCreationAttributes = Optional<HairAnalysisAttributes, 'id' | 'doctorVerified'>;

export interface HairAnalysisInstance extends Model<HairAnalysisAttributes, HairAnalysisCreationAttributes>, HairAnalysisAttributes {}

export const HairAnalysis = sequelize.define<HairAnalysisInstance>(
  'HairAnalysis',
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
    frontPhoto: DataTypes.TEXT('long'),
    topPhoto: DataTypes.TEXT('long'),
    leftPhoto: DataTypes.TEXT('long'),
    rightPhoto: DataTypes.TEXT('long'),
    backPhoto: DataTypes.TEXT('long'),
    hairLossStage: DataTypes.STRING,
    hairDensity: DataTypes.STRING,
    donorAreaQuality: DataTypes.STRING,
    estimatedMinGrafts: DataTypes.INTEGER,
    estimatedMaxGrafts: DataTypes.INTEGER,
    aiAnalysis: DataTypes.TEXT('long'),
    doctorVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'hair_analyses',
    timestamps: true,
  }
);

export default HairAnalysis;
