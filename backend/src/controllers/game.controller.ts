import { Request, Response, NextFunction } from 'express';
import {
  verifyOrStartStudent,
  getAvailableBoxes,
  selectMysteryBox,
  getGameStatus,
  GameError,
} from '../services/game.service';
import { env } from '../config/env';

export async function startGameHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { rollNumber, campaignId } = req.body;
    const targetCampaignId = campaignId || env.CAMPAIGN_ID;

    const result = await verifyOrStartStudent(rollNumber, targetCampaignId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBoxesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.participation) {
      throw new GameError('Unauthorized participation.', 401);
    }

    const boxesData = await getAvailableBoxes(req.participation.participationId);

    res.status(200).json({
      success: true,
      data: boxesData,
    });
  } catch (error) {
    next(error);
  }
}

export async function selectBoxHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.participation) {
      throw new GameError('Unauthorized participation.', 401);
    }

    const { boxNumber } = req.body;
    const result = await selectMysteryBox(req.participation.participationId, boxNumber);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.participation) {
      throw new GameError('Unauthorized participation.', 401);
    }

    const statusData = await getGameStatus(req.participation.participationId);

    res.status(200).json({
      success: true,
      data: statusData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRewardsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.participation) {
      throw new GameError('Unauthorized participation.', 401);
    }

    const statusData = await getGameStatus(req.participation.participationId);

    res.status(200).json({
      success: true,
      data: {
        rewards: statusData.rewards,
        finalDiscount: statusData.finalDiscount,
        finalRewardCode: statusData.finalRewardCode,
        status: statusData.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function claimCurrentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.participation) {
      throw new GameError('Unauthorized participation.', 401);
    }

    const { claimCurrentReward } = await import('../services/game.service');
    const result = await claimCurrentReward(req.participation.participationId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

