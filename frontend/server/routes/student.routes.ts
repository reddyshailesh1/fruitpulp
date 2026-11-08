import { Router } from 'express';
import { verifyStudentHandler } from '../controllers/student.controller';
import { rollNumberLimiter } from '../middleware/rateLimiter';
import { validateBody, verifyRollNumberSchema } from '../middleware/validation';

const router = Router();

router.post(
  '/verify',
  rollNumberLimiter,
  validateBody(verifyRollNumberSchema),
  verifyStudentHandler
);

export default router;
