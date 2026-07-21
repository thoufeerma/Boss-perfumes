export const paymentConfig = {
  provider: process.env.PAYMENT_PROVIDER ?? "checkoutcom",

  checkoutcom: {
    publicKey: process.env.CHECKOUT_PUBLIC_KEY,
    secretKey: process.env.CHECKOUT_SECRET_KEY,
    processingChannelId: process.env.CHECKOUT_PROCESSING_CHANNEL_ID,
  },

  telr: {
    storeId: process.env.TELR_STORE_ID,
    authKey: process.env.TELR_AUTH_KEY,
    gatewayUrl: process.env.TELR_GATEWAY_URL,
    webhookSecret: process.env.TELR_WEBHOOK_SECRET,
  }
};
