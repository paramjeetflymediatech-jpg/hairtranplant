import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type PlanType = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type SubStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface SubscriptionAttributes {
  id: string;
  clinicId: string;
  plan: PlanType;
  status: SubStatus;
  startDate: string;
  endDate: string;
  billingCycle: BillingCycle;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SubscriptionCreationAttributes = Optional<SubscriptionAttributes, 'id' | 'status' | 'billingCycle'>;

export interface SubscriptionInstance extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>, SubscriptionAttributes {}

export const Subscription = sequelize.define<SubscriptionInstance>(
  'Subscription',
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
    plan: {
      type: DataTypes.ENUM('STARTER', 'PROFESSIONAL', 'ENTERPRISE'),
      defaultValue: 'PROFESSIONAL',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED'),
      defaultValue: 'ACTIVE',
    },
    startDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    billingCycle: {
      type: DataTypes.ENUM('MONTHLY', 'ANNUAL'),
      defaultValue: 'MONTHLY',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 299.00,
    },
  },
  {
    tableName: 'subscriptions',
    timestamps: true,
  }
);

export default Subscription;
