import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'FINANCING' | 'STRIPE';

export interface PaymentAttributes {
  id: string;
  clinicId: string;
  patientId: string;
  treatmentPlanId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PaymentCreationAttributes = Optional<PaymentAttributes, 'id' | 'currency' | 'status'>;

export interface PaymentInstance extends Model<PaymentAttributes, PaymentCreationAttributes>, PaymentAttributes {}

export const Payment = sequelize.define<PaymentInstance>(
  'Payment',
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
    treatmentPlanId: DataTypes.UUID,
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'),
      defaultValue: 'COMPLETED',
    },
    paymentMethod: {
      type: DataTypes.ENUM('CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'FINANCING', 'STRIPE'),
      defaultValue: 'CREDIT_CARD',
    },
    transactionId: DataTypes.STRING,
  },
  {
    tableName: 'payments',
    timestamps: true,
  }
);

export default Payment;
