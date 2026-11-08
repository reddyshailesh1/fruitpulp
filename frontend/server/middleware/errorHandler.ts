import { Request, Response, NextFunction } from 'express';
import { GameError } from '../services/game.service';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If headers already sent, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof GameError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code || 'GAME_ERROR',
    });
    return;
  }

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    res.status(409).json({
      success: false,
      error: 'Duplicate participation record detected. Please reload.',
      code: 'DUPLICATE_RECORD',
    });
    return;
  }

  // General server error
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected server error occurred. Please try again.',
    code: 'INTERNAL_SERVER_ERROR',
  });
}
