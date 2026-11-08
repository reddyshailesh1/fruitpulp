export type ParticipationStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface IReward {
  boxNumber: number;
  discount: number;
  rewardCode: string;
  selectedAt: string;
  revealedAt: string;
}

export interface IVerifyData {
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

export interface IBoxesData {
  availableBoxes: number[];
  selectedBoxes: number[];
  chancesUsed: number;
  totalChances: number;
  remainingChances: number;
  status: ParticipationStatus;
}

export interface ISelectBoxData {
  reward: IReward;
  chancesUsed: number;
  remainingChances: number;
  status: ParticipationStatus;
  isFinalChance: boolean;
  finalDiscount: number | null;
  finalRewardCode: string | null;
}

export interface IGameStatusData {
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

export type GameView =
  | 'LANDING'
  | 'ROLL_ENTRY'
  | 'MYSTERY_BOXES'
  | 'SCRATCH_CARD'
  | 'PROGRESS_RECAP'
  | 'FINAL_RESULT'
  | 'ALREADY_COMPLETED';
