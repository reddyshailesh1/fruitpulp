import crypto from 'crypto';
import { Campaign, CampaignDocument } from '../db/models/Campaign';
import { IBoxArrangement, IDiscountConfig } from '../types';
import { env } from '../config/env';

export interface IDiscountProbability {
  discount: number;
  weight: number; // percentage (sum = 100)
}

/**
 * Weighted probability distribution:
 * - 5% OFF: 50% probability (Highest probability)
 * - 6% OFF: 25% probability (Second highest probability)
 * - 7% OFF: 15% probability
 *   => Combined probability for 5%, 6%, and 7% = 90%
 * - 9% OFF: 5% probability
 * - 10% OFF: 5% probability
 *   => Combined probability for 9% and 10% = 10%
 * Total: 100%
 */
export const WEIGHTED_DISCOUNT_CONFIG: IDiscountProbability[] = [
  { discount: 5, weight: 50 },
  { discount: 6, weight: 25 },
  { discount: 7, weight: 15 },
  { discount: 9, weight: 5 },
  { discount: 10, weight: 5 },
];

/**
 * Samples a discount according to the configured probabilities using crypto.randomInt
 */
export function sampleWeightedDiscount(config: IDiscountProbability[] = WEIGHTED_DISCOUNT_CONFIG): number {
  const rand = crypto.randomInt(0, 100); // 0 to 99
  let cumulative = 0;
  for (const item of config) {
    cumulative += item.weight;
    if (rand < cumulative) {
      return item.discount;
    }
  }
  return config[0].discount;
}

export const DEFAULT_DISCOUNT_CONFIG: IDiscountConfig[] = [
  { discount: 5, count: 4 },
  { discount: 6, count: 2 },
  { discount: 7, count: 1 },
  { discount: 8, count: 1 },
  { discount: 9, count: 1 },
  { discount: 10, count: 0 },
];

/**
 * Builds a 9-box arrangement sampled from the weighted discount distribution
 */
export function generateBoxArrangement(): IBoxArrangement[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((boxNumber) => ({
    boxNumber,
    discount: sampleWeightedDiscount(),
  }));
}

/**
 * Ensures the default campaign exists and is active.
 */
export async function getOrCreateCampaign(campaignId: string = env.CAMPAIGN_ID): Promise<CampaignDocument> {
  let campaign = await Campaign.findOne({ campaignId });

  if (!campaign) {
    const boxArrangement = generateBoxArrangement();
    campaign = await Campaign.create({
      campaignId,
      name: 'Orange Pulp Juice Point – Fresh Student Discount Carnival',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
      totalBoxes: 9,
      totalChances: 3,
      discountConfiguration: DEFAULT_DISCOUNT_CONFIG,
      boxArrangement,
    });
    console.log(`🍊 Campaign ${campaignId} initialized with weighted discount distribution.`);
  }

  return campaign;
}

/**
 * Validates whether a campaign is currently active
 */
export function isCampaignActive(campaign: CampaignDocument): { active: boolean; reason?: string } {
  if (campaign.status === 'INACTIVE') {
    return { active: false, reason: 'Campaign is currently paused or inactive.' };
  }
  const now = new Date();
  if (now > campaign.endDate || campaign.status === 'EXPIRED') {
    return { active: false, reason: 'Campaign has expired.' };
  }
  if (now < campaign.startDate) {
    return { active: false, reason: 'Campaign has not started yet.' };
  }
  return { active: true };
}
