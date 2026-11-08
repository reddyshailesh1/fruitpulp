import mongoose, { Schema, Document } from 'mongoose';
import { IParticipation, IReward } from '../../types';

export interface ParticipationDocument extends Omit<IParticipation, '_id' | 'createdAt'>, Document {
  createdAt: Date;
}

const RewardSchema = new Schema<IReward>(
  {
    boxNumber: { type: Number, required: true },
    discount: { type: Number, required: true },
    rewardCode: { type: String, required: true },
    selectedAt: { type: Date, required: true, default: () => new Date() },
    revealedAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false }
);

const ParticipationSchema = new Schema<ParticipationDocument>(
  {
    campaignId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    chancesUsed: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    selectedBoxes: {
      type: [Number],
      default: [],
    },
    rewards: {
      type: [RewardSchema],
      default: [],
    },
    finalDiscount: {
      type: Number,
      default: null,
    },
    finalRewardCode: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      immutable: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

// Unique compound index on campaignId + rollNumber ensures one participation per campaign
ParticipationSchema.index({ campaignId: 1, rollNumber: 1 }, { unique: true });

export const Participation = mongoose.model<ParticipationDocument>(
  'Participation',
  ParticipationSchema
);
