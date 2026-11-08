import mongoose, { Schema, Document } from 'mongoose';
import { ICampaign } from '../../types';

export interface CampaignDocument extends Omit<ICampaign, 'createdAt'>, Document {
  createdAt: Date;
}

const BoxArrangementSchema = new Schema(
  {
    boxNumber: { type: Number, required: true },
    discount: { type: Number, required: true },
  },
  { _id: false }
);

const DiscountConfigSchema = new Schema(
  {
    discount: { type: Number, required: true },
    count: { type: Number, required: true },
  },
  { _id: false }
);

const CampaignSchema = new Schema<CampaignDocument>(
  {
    campaignId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    endDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
    },
    totalBoxes: {
      type: Number,
      default: 9,
      immutable: true,
    },
    totalChances: {
      type: Number,
      default: 3,
      immutable: true,
    },
    discountConfiguration: {
      type: [DiscountConfigSchema],
      required: true,
    },
    boxArrangement: {
      type: [BoxArrangementSchema],
      required: true,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      immutable: true,
    },
  },
  {
    versionKey: false,
  }
);

export const Campaign = mongoose.model<CampaignDocument>('Campaign', CampaignSchema);
