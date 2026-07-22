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

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: string;
  public clinicId!: string;
  public patientId!: string;
  public treatmentPlanId?: string;
  public amount!: number;
  public currency!: string;
  public status!: PaymentStatus;
  public paymentMethod!: PaymentMethod;
  public transactionId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
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
    sequelize,
    tableName: 'payments',
    timestamps: true,
  }
);

export default Payment;
