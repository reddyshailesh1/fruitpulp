import { Router } from 'express';
import {
  startGameHandler,
  getBoxesHandler,
  selectBoxHandler,
  getStatusHandler,
  getRewardsHandler,
  claimCurrentHandler,
} from '../controllers/game.controller';
import { requireParticipationAuth } from '../middleware/auth';
import { rollNumberLimiter } from '../middleware/rateLimiter';
import { validateBody, verifyRollNumberSchema, selectBoxSchema } from '../middleware/validation';

const router = Router();

// Start or restore game
router.post(
  '/start',
  rollNumberLimiter,
  validateBody(verifyRollNumberSchema),
  startGameHandler
);

// Protected routes (requires valid participation token)
router.get('/boxes', requireParticipationAuth, getBoxesHandler);
router.post('/select', requireParticipationAuth, validateBody(selectBoxSchema), selectBoxHandler);
router.post('/claim-current', requireParticipationAuth, claimCurrentHandler);
router.get('/status', requireParticipationAuth, getStatusHandler);
router.get('/rewards', requireParticipationAuth, getRewardsHandler);

export default router;
