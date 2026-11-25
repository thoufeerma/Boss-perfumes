import crypto from 'crypto';
import { redis } from './redis';

// Key for encrypting the password held during email verification. It must come from
// OTP_SECRET: falling back to a constant in source code would let anyone with the code
// (or a Redis dump) decrypt those passwords.
const getKey = () => {
  const secret = process.env.OTP_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('OTP_SECRET must be set to at least 32 characters.');
  }
  // Ensure key is 32 bytes for AES-256-GCM
  return crypto.createHash('sha256').update(secret).digest();
};

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
 * The client's IP address, for rate limiting.
 *
 * The left-most `x-forwarded-for` entry is whatever the client chose to send, so keying
 * a limit on it lets an attacker pick a fresh "IP" per request. The right-most entry is
 * the one added by the proxy in front of the app (Vercel, nginx, Cloudflare, ...), so
 * that is the one used. Per-email / per-account limits are applied as well wherever
 * possible, since they do not depend on the IP at all.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',').map((s) => s.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Normalises an email / username so `A@x.com` and ` a@x.com` share one limit. */
export function rateLimitKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().slice(0, 254);
}

/**
 * Basic rate limiting using Redis
 * @param identifier e.g., IP address or email
 * @param limit max requests allowed
 * @param windowInSeconds time window in seconds
 * @returns boolean indicating if request is allowed (true) or rate limited (false)
 *
 * Fails open (allows the request) when Redis is unreachable, so an outage does not lock
 * every shopper out of signing in; the error is logged.
 */
export async function checkRateLimit(identifier: string, limit: number = 5, windowInSeconds: number = 60): Promise<boolean> {
  const key = `ratelimit:${identifier}`;
  try {
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, windowInSeconds);
    } else if (currentCount > limit) {
      // Self-heal a counter whose expiry was never set (e.g. the expire call failed),
      // which would otherwise block this identifier forever.
      const ttl = await redis.ttl(key);
      if (ttl < 0) await redis.expire(key, windowInSeconds);
    }

    return currentCount <= limit;
  } catch (error) {
    console.error(`[RateLimit] Redis unavailable; allowing request for ${identifier.split(':')[0]}`, error);
    return true;
  }
}
