import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().default('orange_pulp_secret_salt_2025_juicy_discount_key'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CAMPAIGN_ID: z.string().default('CAMP-ORANGE-2025'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
