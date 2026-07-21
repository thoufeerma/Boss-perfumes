export interface PaymentSessionRequest {
  orderId: number;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  reference?: string;
  successUrl?: string;
  failureUrl?: string;
  cancelUrl?: string;
  billing?: Record<string, any>;
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
   */
  handleWebhookEvent(payload: any): Promise<{ orderId: number; status: 'approved' | 'declined' | 'captured' | 'refunded' | 'voided' | 'unknown', transactionId?: string, provider?: string } | null>;
}
