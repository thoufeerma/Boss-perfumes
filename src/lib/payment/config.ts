export const paymentConfig = {
  checkoutcom: {
    enabled: process.env.NEXT_PUBLIC_CHECKOUT_ENABLED !== "false" && process.env.CHECKOUT_ENABLED !== "false",
    publicKey: process.env.NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY || process.env.CHECKOUT_PUBLIC_KEY,
    secretKey: process.env.CHECKOUT_SECRET_KEY,
    processingChannelId: process.env.CHECKOUT_PROCESSING_CHANNEL_ID,
  },

  tabby: {
    enabled: process.env.NEXT_PUBLIC_TABBY_ENABLED === "true" || process.env.TABBY_ENABLED === "true",
    publicKey: process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY || process.env.TABBY_PUBLIC_KEY,
    secretKey: process.env.TABBY_SECRET_KEY,
    apiUrl: process.env.NEXT_PUBLIC_TABBY_API_URL || process.env.TABBY_API_URL || "https://api.tabby.ai/api/v2",
    webhookSecret: process.env.TABBY_WEBHOOK_SECRET,
    merchantCode: process.env.NEXT_PUBLIC_TABBY_MERCHANT_CODE || process.env.TABBY_MERCHANT_CODE,
    minAmount: process.env.NEXT_PUBLIC_TABBY_MIN_AMOUNT ? parseFloat(process.env.NEXT_PUBLIC_TABBY_MIN_AMOUNT) : (process.env.TABBY_MIN_AMOUNT ? parseFloat(process.env.TABBY_MIN_AMOUNT) : 10),
    maxAmount: process.env.NEXT_PUBLIC_TABBY_MAX_AMOUNT ? parseFloat(process.env.NEXT_PUBLIC_TABBY_MAX_AMOUNT) : (process.env.TABBY_MAX_AMOUNT ? parseFloat(process.env.TABBY_MAX_AMOUNT) : 5000),
    supportedCurrencies: process.env.NEXT_PUBLIC_TABBY_CURRENCIES ? process.env.NEXT_PUBLIC_TABBY_CURRENCIES.split(",") : (process.env.TABBY_CURRENCIES ? process.env.TABBY_CURRENCIES.split(",") : ["AED", "SAR", "KWD", "BHD", "QAR", "EGP"]),
  },

  telr: {
    enabled: process.env.NEXT_PUBLIC_TELR_ENABLED === "true" || process.env.TELR_ENABLED === "true",
    storeId: process.env.NEXT_PUBLIC_TELR_STORE_ID || process.env.TELR_STORE_ID,
    authKey: process.env.TELR_AUTH_KEY,
    gatewayUrl: process.env.NEXT_PUBLIC_TELR_GATEWAY_URL || process.env.TELR_GATEWAY_URL || "https://secure.telr.com/gateway/order.json",
    webhookSecret: process.env.TELR_WEBHOOK_SECRET,
  }
};
