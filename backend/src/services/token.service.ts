import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ITokenPayload } from '../types';

export function signParticipationToken(payload: ITokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

export function verifyParticipationToken(token: string): ITokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as ITokenPayload;
    if (!decoded.participationId || !decoded.rollNumber || !decoded.campaignId) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired participation token');
  }
}
