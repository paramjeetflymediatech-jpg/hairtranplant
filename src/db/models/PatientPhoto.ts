import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type PhotoType =
  | 'BEFORE'
  | 'DAY_1'
  | 'MONTH_1'
  | 'MONTH_3'
  | 'MONTH_6'
  | 'MONTH_9'
  | 'MONTH_12'
  | 'AFTER';

export interface PatientPhotoAttributes {
  id: string;
  clinicId: string;
  patientId: string;
  type: PhotoType;
  imageUrl: string;
  capturedAt: string; // YYYY-MM-DD
  notes?: string;
  isPublicConsent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PatientPhotoCreationAttributes = Optional<PatientPhotoAttributes, 'id' | 'isPublicConsent'>;

export class PatientPhoto extends Model<PatientPhotoAttributes, PatientPhotoCreationAttributes> implements PatientPhotoAttributes {
  public id!: string;
  public clinicId!: string;
  public patientId!: string;
  public type!: PhotoType;
  public imageUrl!: string;
  public capturedAt!: string;
  public notes?: string;
  public isPublicConsent!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PatientPhoto.init(
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
    type: {
      type: DataTypes.ENUM('BEFORE', 'DAY_1', 'MONTH_1', 'MONTH_3', 'MONTH_6', 'MONTH_9', 'MONTH_12', 'AFTER'),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    capturedAt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: DataTypes.TEXT,
    isPublicConsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'patient_photos',
    timestamps: true,
  }
);

export default PatientPhoto;
