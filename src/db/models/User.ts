import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type UserRole = 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR' | 'CONSULTANT' | 'RECEPTIONIST' | 'PATIENT' | string;

export interface UserAttributes {
  id: string;
  clinicId?: string | null;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isActive'>;

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export const User = sequelize.define<UserInstance>(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => Math.random().toString(36).substring(2) + Date.now().toString(36),
      primaryKey: true,
    },
    clinicId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PATIENT',
    },
    avatar: DataTypes.TEXT,
    phone: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: DataTypes.DATE,
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
