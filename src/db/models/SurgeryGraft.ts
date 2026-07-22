import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

export type GraftType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'MULTI';

export interface SurgeryGraftAttributes {
  id: string;
  surgeryId: string;
  graftType: GraftType;
  quantity: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SurgeryGraftCreationAttributes = Optional<SurgeryGraftAttributes, 'id'>;

export class SurgeryGraft extends Model<SurgeryGraftAttributes, SurgeryGraftCreationAttributes> implements SurgeryGraftAttributes {
  public id!: string;
  public surgeryId!: string;
  public graftType!: GraftType;
  public quantity!: number;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SurgeryGraft.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => Math.random().toString(36).substring(2) + Date.now().toString(36),
      primaryKey: true,
    },
    surgeryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    graftType: {
      type: DataTypes.ENUM('SINGLE', 'DOUBLE', 'TRIPLE', 'MULTI'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    tableName: 'surgery_grafts',
    timestamps: true,
  }
);

export default SurgeryGraft;
