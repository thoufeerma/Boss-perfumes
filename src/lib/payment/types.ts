import type { Locale } from "@/lib/i18n/config";

export interface PaymentSessionRequest {
  orderId: number;
  amount: number;
  currency: string;
  /** Language the shopper is reading, forwarded to providers that host their own checkout. */
  locale?: Locale;
  customerEmail: string;
  customerName?: string;
  reference?: string;
  successUrl?: string;
  failureUrl?: string;
  cancelUrl?: string;
  billing?: Record<string, any>;
  shipping?: Record<string, any>;
  items?: any[];
  customerId?: number;
  buyerHistory?: any;
  orderHistory?: any[];
  orderKey?: string;
  paymentUrl?: string;
}

export interface PaymentSessionResponse {
  sessionId: string;
  publicKey?: string;
  redirectUrl?: string;
}

export interface PaymentProvider {
  /**
   * Initializes a payment session with the provider.
   */
  createSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse>;

  /**
   * Verifies the webhook signature if applicable.
   */
  verifyWebhook(headers: Headers, rawBody: string): boolean;

  /**
   * Parses and handles the incoming webhook payload.
   * Resolves with standardized status and metadata.
   *
   * `eventId` is the de-duplication key. Providers that reuse one id across every event on
   * a payment (Tabby does) must supply a key that is unique per event, otherwise later
   * events such as refunds are discarded as repeats. Omit it to fall back to `payload.id`.
   */
  handleWebhookEvent(payload: any): Promise<{ orderId: number; status: 'pending' | 'authorized' | 'processing' | 'completed' | 'cancelled' | 'failed' | 'refunded', eventId?: string, transactionId?: string, provider?: string, metadata?: Record<string, any> } | null>;

  /**
   * Evaluates if the provider is eligible for the current cart/order.
   */
  isEligible(cartData: any, locale?: Locale): Promise<{ eligible: boolean; reason?: string }>;
}
