import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      res.status(400).json({
        success: false,
        error: errorMessages,
        code: 'VALIDATION_ERROR',
        details: result.error.errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export const verifyRollNumberSchema = z.object({
  rollNumber: z
    .string({ required_error: 'Roll number is required' })
    .min(3, 'Roll number must have at least 3 characters')
    .max(25, 'Roll number cannot exceed 25 characters'),
  campaignId: z.string().optional(),
});

export const selectBoxSchema = z.object({
  boxNumber: z
    .number({ required_error: 'Box number is required' })
    .int('Box number must be an integer')
    .min(1, 'Box number must be between 1 and 9')
    .max(9, 'Box number must be between 1 and 9'),
});
