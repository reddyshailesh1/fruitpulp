import { Request, Response, NextFunction } from 'express';
import { verifyOrStartStudent } from '../services/game.service';
import { env } from '../config/env';

export async function verifyStudentHandler(
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
