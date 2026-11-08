import crypto from 'crypto';

/**
 * Generates a human-readable, tamper-resistant reward verification code
 * Example: OP-7-K89X24
 */
export function generateRewardCode(
  campaignId: string,
  rollNumber: string,
  chanceNumber: number,
  discount: number
): string {
  const hash = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'orange_pulp_secret')
    .update(`${campaignId}:${rollNumber}:${chanceNumber}:${discount}:${Date.now()}:${crypto.randomBytes(8).toString('hex')}`)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();

  return `OP-${discount}-${hash}`;
}

/**
 * Cryptographically secure Fisher-Yates array shuffle using crypto.randomInt
 */
export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
