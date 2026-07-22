import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type UserRole = 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR' | 'CONSULTANT' | 'RECEPTIONIST' | 'PATIENT';

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

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public clinicId?: string | null;
  public name!: string;
  public email!: string;
  public password?: string;
  public role!: UserRole;
  public avatar?: string;
  public phone?: string;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
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
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'CONSULTANT', 'RECEPTIONIST', 'PATIENT'),
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
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
