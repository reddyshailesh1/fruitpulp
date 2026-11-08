import { Request, Response, NextFunction } from 'express';
import { verifyParticipationToken } from '../services/token.service';
import { ITokenPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      participation?: ITokenPayload;
    }
  }
}

export function requireParticipationAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-participation-token'] as string | undefined;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Missing participation authentication token. Please enter your roll number first.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  try {
    const decoded = verifyParticipationToken(token);
    req.participation = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired participation session. Please verify your roll number again.',
      code: 'TOKEN_INVALID',
    });
  }
}
