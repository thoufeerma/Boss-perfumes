import crypto from 'crypto';
import { redis } from './redis';

const ENCRYPTION_KEY = process.env.OTP_SECRET || process.env.WC_CONSUMER_SECRET || 'default_secret_32_chars_long_123!';
// Ensure key is 32 bytes for AES-256-GCM
const getKey = () => crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();

export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  
  let encrypted = cipher.update(password, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');
  
  return `${iv.toString('base64')}:${encrypted}:${authTag}`;
}

export function decryptPassword(encryptedStr: string): string {
  const [ivStr, encrypted, authTagStr] = encryptedStr.split(':');
  if (!ivStr || !encrypted || !authTagStr) {
    throw new Error('Invalid encrypted format');
  }
  
  const iv = Buffer.from(ivStr, 'base64');
  const authTag = Buffer.from(authTagStr, 'base64');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Basic rate limiting using Redis
 * @param identifier e.g., IP address or email
 * @param limit max requests allowed
 * @param windowInSeconds time window in seconds
 * @returns boolean indicating if request is allowed (true) or rate limited (false)
 */
export async function checkRateLimit(identifier: string, limit: number = 5, windowInSeconds: number = 60): Promise<boolean> {
  const key = `ratelimit:${identifier}`;
  const currentCount = await redis.incr(key);
  
  if (currentCount === 1) {
    await redis.expire(key, windowInSeconds);
  }
  
  if (currentCount > limit) {
    return false;
  }
  
  return true;
}
