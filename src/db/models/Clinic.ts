import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export interface ClinicAttributes {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  logo?: string;
  backgroundImage?: string;
  themeColor?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  subscriptionPlan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED';
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClinicCreationAttributes = Optional<ClinicAttributes, 'id' | 'subscriptionPlan' | 'subscriptionStatus'>;

export interface ClinicInstance extends Model<ClinicAttributes, ClinicCreationAttributes>, ClinicAttributes {}

export const Clinic = sequelize.define<ClinicInstance>(
  'Clinic',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => Math.random().toString(36).substring(2) + Date.now().toString(36),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: DataTypes.STRING,
    logo: DataTypes.TEXT,
    backgroundImage: DataTypes.TEXT,
    themeColor: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC',
    },
    subscriptionPlan: {
      type: DataTypes.ENUM('STARTER', 'PROFESSIONAL', 'ENTERPRISE'),
      defaultValue: 'PROFESSIONAL',
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED'),
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'clinics',
    timestamps: true,
  }
);

export default Clinic;
