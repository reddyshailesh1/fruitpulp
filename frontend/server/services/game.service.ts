import mongoose from 'mongoose';
import { Participation } from '../db/models/Participation';
import { getOrCreateCampaign, isCampaignActive, sampleWeightedDiscount } from './campaign.service';
import { signParticipationToken } from './token.service';
import { generateRewardCode } from '../utils/crypto';
import { normalizeRollNumber, isValidRollNumber } from '../utils/rollNumber';
import {
  IVerifyResponse,
  IGameStatusResponse,
  ISelectBoxResponse,
  IReward,
} from '../types';

export class GameError extends Error {
  statusCode: number;
  code?: string;
  constructor(message: string, statusCode: number = 400, code?: string) {
    super(message);
    this.name = 'GameError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

// In-memory fallback map for serverless execution without MongoDB Atlas URI
const memoryParticipations = new Map<string, any>();

function getMemoryKey(campaignId: string, rollNumber: string) {
  return `${campaignId}:${rollNumber}`;
}

export async function verifyOrStartStudent(
  rawRollNumber: string,
  campaignId: string
): Promise<IVerifyResponse> {
  const rollNumber = normalizeRollNumber(rawRollNumber);

  if (!isValidRollNumber(rollNumber)) {
    throw new GameError(
      'Invalid college roll number. Please enter 3 to 25 alphanumeric characters.',
      400,
      'INVALID_ROLL_NUMBER'
    );
  }

  const campaign = await getOrCreateCampaign(campaignId);
  const statusCheck = isCampaignActive(campaign);
  if (!statusCheck.active) {
    throw new GameError(statusCheck.reason || 'Campaign is not active.', 400, 'CAMPAIGN_INACTIVE');
  }

  let participation: any = null;

  if (mongoose.connection.readyState === 1) {
    try {
      participation = await Participation.findOne({ campaignId, rollNumber });
      if (!participation) {
        participation = await Participation.create({
          campaignId,
          rollNumber,
          chancesUsed: 0,
          selectedBoxes: [],
          rewards: [],
          finalDiscount: null,
          finalRewardCode: null,
          status: 'IN_PROGRESS',
          createdAt: new Date(),
          completedAt: null,
        });
      }
    } catch (err: any) {
      if (err.code === 11000) {
        participation = await Participation.findOne({ campaignId, rollNumber });
      } else {
        console.warn('Mongoose query failed, using memory store:', err);
      }
    }
  }

  // Memory fallback
  if (!participation) {
    const key = getMemoryKey(campaignId, rollNumber);
    if (!memoryParticipations.has(key)) {
      const newPart = {
        _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        campaignId,
        rollNumber,
        chancesUsed: 0,
        selectedBoxes: [],
        rewards: [],
        finalDiscount: null,
        finalRewardCode: null,
        status: 'IN_PROGRESS',
        createdAt: new Date(),
        completedAt: null,
      };
      memoryParticipations.set(key, newPart);
      memoryParticipations.set(newPart._id, newPart);
    }
    participation = memoryParticipations.get(key);
  }

  const partId = participation._id ? participation._id.toString() : participation.id;

  const token = signParticipationToken({
    participationId: partId,
    rollNumber: participation.rollNumber,
    campaignId: participation.campaignId,
  });

  return {
    rollNumber: participation.rollNumber,
    campaignId: participation.campaignId,
    status: participation.status,
    chancesUsed: participation.chancesUsed,
    totalChances: 3,
    selectedBoxes: participation.selectedBoxes,
    rewards: participation.rewards,
    finalDiscount: participation.finalDiscount,
    finalRewardCode: participation.finalRewardCode,
    token,
  };
}

async function findParticipationById(participationId: string): Promise<any> {
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Participation.findById(participationId);
      if (doc) return doc;
    } catch (e) {}
  }
  return memoryParticipations.get(participationId) || null;
}

export async function getAvailableBoxes(participationId: string): Promise<{
  availableBoxes: number[];
  selectedBoxes: number[];
  chancesUsed: number;
  totalChances: number;
  remainingChances: number;
  status: string;
}> {
  const participation = await findParticipationById(participationId);
  if (!participation) {
    throw new GameError('Participation record not found.', 404, 'NOT_FOUND');
  }

  const allBoxes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const selectedSet = new Set(participation.selectedBoxes || []);
  const availableBoxes = allBoxes.filter((box) => !selectedSet.has(box));

  return {
    availableBoxes,
    selectedBoxes: participation.selectedBoxes || [],
    chancesUsed: participation.chancesUsed || 0,
    totalChances: 3,
    remainingChances: Math.max(0, 3 - (participation.chancesUsed || 0)),
    status: participation.status,
  };
}

export async function selectMysteryBox(
  participationId: string,
  boxNumber: number
): Promise<ISelectBoxResponse> {
  if (!Number.isInteger(boxNumber) || boxNumber < 1 || boxNumber > 9) {
    throw new GameError('Invalid box number. Must be an integer between 1 and 9.', 400);
  }

  const participation = await findParticipationById(participationId);
  if (!participation) {
    throw new GameError('Participation record not found.', 404, 'NOT_FOUND');
  }

  if (participation.status === 'COMPLETED' || participation.chancesUsed >= 3) {
    throw new GameError(
      'Game already completed. You have used all 3 chances.',
      400,
      'GAME_ALREADY_COMPLETED'
    );
  }

  const existingReward = (participation.rewards || []).find((r: any) => r.boxNumber === boxNumber);
  if (existingReward) {
    const isFinal = participation.chancesUsed === 3;
    return {
      reward: existingReward,
      chancesUsed: participation.chancesUsed,
      remainingChances: Math.max(0, 3 - participation.chancesUsed),
      status: participation.status,
      isFinalChance: isFinal,
      finalDiscount: participation.finalDiscount,
      finalRewardCode: participation.finalRewardCode,
    };
  }

  if ((participation.selectedBoxes || []).includes(boxNumber)) {
    throw new GameError(
      `Box ${boxNumber} has already been selected by you. Please pick a different mystery box.`,
      400,
      'BOX_ALREADY_SELECTED'
    );
  }

  const campaign = await getOrCreateCampaign(participation.campaignId);
  const statusCheck = isCampaignActive(campaign);
  if (!statusCheck.active) {
    throw new GameError(statusCheck.reason || 'Campaign is not active.', 400, 'CAMPAIGN_INACTIVE');
  }

  // Draw discount using the calibrated weighted probabilities:
  // 5%, 6%, 7% combine to 90% probability (5% = 50%, 6% = 25%, 7% = 15%)
  // 9% and 10% combine to 10% probability (9% = 5%, 10% = 5%)
  const boxConfig = campaign.boxArrangement?.find((b: any) => b.boxNumber === boxNumber);
  const assignedDiscount =
    process.env.NODE_ENV === 'test' && boxConfig && boxConfig.discount
      ? boxConfig.discount
      : sampleWeightedDiscount();

  const nextChance = participation.chancesUsed + 1;
  const isFinalChance = nextChance === 3;

  const rewardCode = generateRewardCode(
    participation.campaignId,
    participation.rollNumber,
    nextChance,
    assignedDiscount
  );

  const newReward: IReward = {
    boxNumber,
    discount: assignedDiscount,
    rewardCode,
    selectedAt: new Date(),
    revealedAt: new Date(),
  };

  if (mongoose.connection.readyState === 1 && typeof participation.save === 'function') {
    const updateQuery: any = {
      $push: { selectedBoxes: boxNumber, rewards: newReward },
      $inc: { chancesUsed: 1 },
    };

    if (isFinalChance) {
      updateQuery.$set = {
        finalDiscount: assignedDiscount,
        finalRewardCode: rewardCode,
        status: 'COMPLETED',
        completedAt: new Date(),
      };
    }

    const updated = await Participation.findOneAndUpdate(
      {
        _id: participationId,
        chancesUsed: participation.chancesUsed,
        selectedBoxes: { $ne: boxNumber },
        status: 'IN_PROGRESS',
      },
      updateQuery,
      { new: true }
    );

    if (updated) {
      return {
        reward: newReward,
        chancesUsed: updated.chancesUsed,
        remainingChances: Math.max(0, 3 - updated.chancesUsed),
        status: updated.status,
        isFinalChance,
        finalDiscount: updated.finalDiscount,
        finalRewardCode: updated.finalRewardCode,
      };
    }
  }

  // In-memory update
  participation.selectedBoxes.push(boxNumber);
  participation.rewards.push(newReward);
  participation.chancesUsed += 1;
  if (isFinalChance) {
    participation.finalDiscount = assignedDiscount;
    participation.finalRewardCode = rewardCode;
    participation.status = 'COMPLETED';
    participation.completedAt = new Date();
  }

  return {
    reward: newReward,
    chancesUsed: participation.chancesUsed,
    remainingChances: Math.max(0, 3 - participation.chancesUsed),
    status: participation.status,
    isFinalChance,
    finalDiscount: participation.finalDiscount,
    finalRewardCode: participation.finalRewardCode,
  };
}

export async function getGameStatus(participationId: string): Promise<IGameStatusResponse> {
  const participation = await findParticipationById(participationId);
  if (!participation) {
    throw new GameError('Participation record not found.', 404, 'NOT_FOUND');
  }

  return {
    rollNumber: participation.rollNumber,
    campaignId: participation.campaignId,
    status: participation.status,
    chancesUsed: participation.chancesUsed,
    totalChances: 3,
    remainingChances: Math.max(0, 3 - participation.chancesUsed),
    selectedBoxes: participation.selectedBoxes,
    rewards: participation.rewards,
    finalDiscount: participation.finalDiscount,
    finalRewardCode: participation.finalRewardCode,
    currentRewardToScratch:
      participation.rewards && participation.rewards.length > 0
        ? participation.rewards[participation.rewards.length - 1]
        : null,
  };
}

export async function claimCurrentReward(
  participationId: string
): Promise<{
  finalDiscount: number;
  finalRewardCode: string;
  status: 'COMPLETED';
  rewards: IReward[];
}> {
  const participation = await findParticipationById(participationId);
  if (!participation) {
    throw new GameError('Participation record not found.', 404, 'NOT_FOUND');
  }

  if (participation.status === 'COMPLETED' && participation.finalDiscount !== null) {
    return {
      finalDiscount: participation.finalDiscount,
      finalRewardCode: participation.finalRewardCode || '',
      status: 'COMPLETED',
      rewards: participation.rewards,
    };
  }

  if (!participation.rewards || participation.rewards.length === 0) {
    throw new GameError('No discount coupon available to utilize. Please open a mystery box first.', 400);
  }

  const latestReward = participation.rewards[participation.rewards.length - 1];

  participation.finalDiscount = latestReward.discount;
  participation.finalRewardCode = latestReward.rewardCode;
  participation.status = 'COMPLETED';
  participation.completedAt = new Date();

  if (typeof participation.save === 'function') {
    await participation.save();
  }

  return {
    finalDiscount: participation.finalDiscount,
    finalRewardCode: participation.finalRewardCode,
    status: 'COMPLETED',
    rewards: participation.rewards,
  };
}
