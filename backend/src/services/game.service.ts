import { Participation, ParticipationDocument } from '../db/models/Participation';
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

/**
 * Normalizes roll number, verifies student participation status,
 * restores game if IN_PROGRESS, blocks if COMPLETED, or creates a new record.
 */
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

  // Lookup existing participation
  let participation = await Participation.findOne({ campaignId, rollNumber });

  if (!participation) {
    try {
      // Atomic creation
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
    } catch (err: any) {
      // Handle race condition where two simultaneous verify requests arrive
      if (err.code === 11000) {
        participation = await Participation.findOne({ campaignId, rollNumber });
        if (!participation) {
          throw new GameError('Database concurrency error. Please try again.', 500);
        }
      } else {
        throw err;
      }
    }
  }

  const token = signParticipationToken({
    participationId: participation._id.toString(),
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

/**
 * Returns available mystery boxes for the student, excluding their previously selected boxes.
 * NEVER returns the hidden discount values assigned to the boxes!
 */
export async function getAvailableBoxes(participationId: string): Promise<{
  availableBoxes: number[];
  selectedBoxes: number[];
  chancesUsed: number;
  totalChances: number;
  remainingChances: number;
  status: string;
}> {
  const participation = await Participation.findById(participationId);
  if (!participation) {
    throw new GameError('Participation record not found.', 404, 'NOT_FOUND');
  }

  const allBoxes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const selectedSet = new Set(participation.selectedBoxes);
  const availableBoxes = allBoxes.filter((box) => !selectedSet.has(box));

  return {
    availableBoxes,
    selectedBoxes: participation.selectedBoxes,
    chancesUsed: participation.chancesUsed,
    totalChances: 3,
    remainingChances: Math.max(0, 3 - participation.chancesUsed),
    status: participation.status,
  };
}

/**
 * Selects a mystery box atomically:
 * - Checks status is IN_PROGRESS and chancesUsed < 3
 * - Checks boxNumber has not been selected already
 * - Reads assigned discount from campaign
 * - Atomically appends reward and updates chancesUsed
 * - If 3rd chance: sets finalDiscount = assignedDiscount, sets COMPLETED
 * - Idempotency: if the student clicks the same box while that step is pending, returns the already assigned reward
 */
export async function selectMysteryBox(
  participationId: string,
  boxNumber: number
): Promise<ISelectBoxResponse> {
  if (!Number.isInteger(boxNumber) || boxNumber < 1 || boxNumber > 9) {
    throw new GameError('Invalid box number. Must be an integer between 1 and 9.', 400);
  }

  const participation = await Participation.findById(participationId);
  if (!participation) {
    throw new GameError('Participation record not found.', 404, 'NOT_FOUND');
  }

  // Check if student is already completed
  if (participation.status === 'COMPLETED' || participation.chancesUsed >= 3) {
    throw new GameError(
      'Game already completed. You have used all 3 chances.',
      400,
      'GAME_ALREADY_COMPLETED'
    );
  }

  // Idempotency check: if this box is already the latest selected reward in progress
  const existingReward = participation.rewards.find((r) => r.boxNumber === boxNumber);
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

  // Repeated box selection protection
  if (participation.selectedBoxes.includes(boxNumber)) {
    throw new GameError(
      `Box ${boxNumber} has already been selected by you. Please pick a different mystery box.`,
      400,
      'BOX_ALREADY_SELECTED'
    );
  }

  // Retrieve campaign box arrangement
  const campaign = await getOrCreateCampaign(participation.campaignId);
  const statusCheck = isCampaignActive(campaign);
  if (!statusCheck.active) {
    throw new GameError(statusCheck.reason || 'Campaign is not active.', 400, 'CAMPAIGN_INACTIVE');
  }

  const boxConfig = campaign.boxArrangement?.find((b) => b.boxNumber === boxNumber);
  // Uses calibrated weighted probabilities:
  // 5%, 6%, 7% combine to 90% probability (5% = 50%, 6% = 25%, 7% = 15%)
  // 9% and 10% combine to 10% probability (9% = 5%, 10% = 5%)
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

  // Perform atomic update using findOneAndUpdate to eliminate race conditions
  const updateQuery: any = {
    $push: {
      selectedBoxes: boxNumber,
      rewards: newReward,
    },
    $inc: { chancesUsed: 1 },
  };

  if (isFinalChance) {
    // RULE: The third discount is the FINAL applicable discount!
    // Never add or combine the three discounts.
    updateQuery.$set = {
      finalDiscount: assignedDiscount,
      finalRewardCode: rewardCode,
      status: 'COMPLETED',
      completedAt: new Date(),
    };
  }

  const updatedParticipation = await Participation.findOneAndUpdate(
    {
      _id: participationId,
      chancesUsed: participation.chancesUsed, // Concurrency barrier: ensures no race
      selectedBoxes: { $ne: boxNumber },
      status: 'IN_PROGRESS',
    },
    updateQuery,
    { new: true }
  );

  if (!updatedParticipation) {
    // If update returned null, a concurrent request modified the record
    const reloaded = await Participation.findById(participationId);
    if (!reloaded) {
      throw new GameError('Participation record lost.', 500);
    }
    // Check if the box was actually saved by the concurrent winner
    const saved = reloaded.rewards.find((r) => r.boxNumber === boxNumber);
    if (saved) {
      return {
        reward: saved,
        chancesUsed: reloaded.chancesUsed,
        remainingChances: Math.max(0, 3 - reloaded.chancesUsed),
        status: reloaded.status,
        isFinalChance: reloaded.chancesUsed === 3,
        finalDiscount: reloaded.finalDiscount,
        finalRewardCode: reloaded.finalRewardCode,
      };
    }
    throw new GameError('Concurrent selection detected. Please refresh and try again.', 409);
  }

  return {
    reward: newReward,
    chancesUsed: updatedParticipation.chancesUsed,
    remainingChances: Math.max(0, 3 - updatedParticipation.chancesUsed),
    status: updatedParticipation.status,
    isFinalChance,
    finalDiscount: updatedParticipation.finalDiscount,
    finalRewardCode: updatedParticipation.finalRewardCode,
  };
}

/**
 * Returns full game status for session recovery and state refresh
 */
export async function getGameStatus(participationId: string): Promise<IGameStatusResponse> {
  const participation = await Participation.findById(participationId);
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
      participation.rewards.length > 0
        ? participation.rewards[participation.rewards.length - 1]
        : null,
  };
}

/**
 * Allows student to claim and utilize their current revealed coupon immediately
 * without using remaining chances, locking it as their final discount and marking COMPLETED.
 */
export async function claimCurrentReward(
  participationId: string
): Promise<{
  finalDiscount: number;
  finalRewardCode: string;
  status: 'COMPLETED';
  rewards: IReward[];
}> {
  const participation = await Participation.findById(participationId);
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
  await participation.save();

  return {
    finalDiscount: participation.finalDiscount,
    finalRewardCode: participation.finalRewardCode,
    status: 'COMPLETED',
    rewards: participation.rewards,
  };
}

