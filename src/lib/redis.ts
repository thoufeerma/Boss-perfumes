import { Redis } from '@upstash/redis'

const redisUrl = process.env.REDIS_URL || '';
const redisToken = process.env.REDIS_TOKEN || '';

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
})

export type RegistrationState = {
  verificationId: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordEncrypted: string; // Storing original password but encrypted
  otpHash: string;
  expiresAt: number;
  attempts: number;
  resends: number;
  resendAvailableAt: number;
  createdAt: number;
}

const PREFIX = 'registration:';

export async function saveRegistrationState(state: RegistrationState) {
  // Store with a TTL of 300 seconds (5 minutes)
  await redis.set(PREFIX + state.verificationId, JSON.stringify(state), { ex: 300 });
}

export async function getRegistrationState(verificationId: string): Promise<RegistrationState | null> {
  const data = await redis.get<string | RegistrationState>(PREFIX + verificationId);
  if (!data) return null;
  // Upstash redis parses JSON automatically if it detects it, so we handle both cases
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as RegistrationState;
    } catch {
      return null;
    }
  }
  return data as RegistrationState;
}

export async function deleteRegistrationState(verificationId: string) {
  await redis.del(PREFIX + verificationId);
}
