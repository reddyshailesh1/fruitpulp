export type ParticipationStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface IReward {
  boxNumber: number;
  discount: number;
  rewardCode: string;
  selectedAt: Date;
  revealedAt: Date;
}

export interface IBoxArrangement {
  boxNumber: number;
  discount: number;
}

export interface IDiscountConfig {
  discount: number;
  count: number;
}

export interface ICampaign {
  campaignId: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  startDate: Date;
  endDate: Date;
  totalBoxes: number;
  totalChances: number;
  discountConfiguration: IDiscountConfig[];
  boxArrangement: IBoxArrangement[];
  createdAt: Date;
}

export interface IParticipation {
  _id: string;
  campaignId: string;
  rollNumber: string;
  chancesUsed: number;
  selectedBoxes: number[];
  rewards: IReward[];
  finalDiscount: number | null;
  finalRewardCode: string | null;
  status: ParticipationStatus;
  createdAt: Date;
  completedAt: Date | null;
}

export interface ITokenPayload {
  participationId: string;
  rollNumber: string;
  campaignId: string;
}

export interface IVerifyResponse {
  rollNumber: string;
  campaignId: string;
  status: ParticipationStatus | 'NOT_STARTED';
  chancesUsed: number;
  totalChances: number;
  selectedBoxes: number[];
  rewards: IReward[];
  finalDiscount: number | null;
  finalRewardCode: string | null;
  token?: string;
}

export interface IGameStatusResponse {
  rollNumber: string;
  campaignId: string;
  status: ParticipationStatus;
  chancesUsed: number;
  totalChances: number;
  remainingChances: number;
  selectedBoxes: number[];
  rewards: IReward[];
  finalDiscount: number | null;
  finalRewardCode: string | null;
  currentRewardToScratch?: IReward | null;
}

export interface ISelectBoxResponse {
  reward: IReward;
  chancesUsed: number;
  remainingChances: number;
  status: ParticipationStatus;
  isFinalChance: boolean;
  finalDiscount: number | null;
  finalRewardCode: string | null;
}
