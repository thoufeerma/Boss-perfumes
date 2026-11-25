import crypto from "crypto";
import { redis } from "@/lib/redis";

/** Constant-time string comparison that also works when the lengths differ. */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a, "utf8").digest();
  const hb = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** Statuses that move an order to paid. */
export const PAID_STATUSES = ["authorized", "completed", "processing"] as const;

export function isPaidStatus(status: string): boolean {
  return (PAID_STATUSES as readonly string[]).includes(status);
}

/**
 * True when `amountPaid` (major units, e.g. 120.50) covers the WooCommerce order total.
 * Stops a genuine payment for a cheap order from being attached to an expensive one.
 */
export function amountCoversOrder(amountPaid: number, order: { total?: string }): boolean {
  const orderTotal = parseFloat(order?.total || "0");
  if (!Number.isFinite(amountPaid) || !Number.isFinite(orderTotal)) return false;
  return amountPaid + 0.01 >= orderTotal;
}

const TRANSACTION_CLAIM_TTL_SECONDS = 60 * 60 * 24 * 180; // 180 days

/**
 * Binds a provider transaction to one WooCommerce order, so a single genuine payment
 * cannot be replayed to mark several orders paid. Returns false when the transaction
 * is already bound to a different order.
 *
 * Throws when Redis is unreachable; callers must then refuse to mark the order paid.
 */
export async function claimTransactionForOrder(provider: string, transactionId: string, orderId: number): Promise<boolean> {
  const key = `payment_txn:${provider.toLowerCase()}:${transactionId}`;
  const claimed = await redis.set(key, String(orderId), { nx: true, ex: TRANSACTION_CLAIM_TTL_SECONDS });
  if (claimed) return true;

  const existing = await redis.get<string | number>(key);
  return existing !== null && String(existing) === String(orderId);
}
