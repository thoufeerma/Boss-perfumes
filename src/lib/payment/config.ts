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
    supportedCurrencies: process.env.NEXT_PUBLIC_TABBY_CURRENCIES ? process.env.NEXT_PUBLIC_TABBY_CURRENCIES.split(",") : (process.env.TABBY_CURRENCIES ? process.env.TABBY_CURRENCIES.split(",") : ["AED", "SAR", "KWD", "BHD", "QAR", "EGP"]),
  },

  telr: {
    enabled: process.env.NEXT_PUBLIC_TELR_ENABLED === "true" || process.env.TELR_ENABLED === "true",
    storeId: process.env.NEXT_PUBLIC_TELR_STORE_ID || process.env.TELR_STORE_ID,
    authKey: process.env.TELR_AUTH_KEY,
    gatewayUrl: process.env.NEXT_PUBLIC_TELR_GATEWAY_URL || process.env.TELR_GATEWAY_URL || "https://secure.telr.com/gateway/order.json",
    webhookSecret: process.env.TELR_WEBHOOK_SECRET,
  },

  woopayments: {
    enabled: process.env.NEXT_PUBLIC_WOOPAYMENTS_ENABLED !== "false" && process.env.WOOPAYMENTS_ENABLED !== "false",
    storeUrl: process.env.NEXT_PUBLIC_WC_STORE_URL,
    webhookSecret: process.env.WOOPAYMENTS_WEBHOOK_SECRET,
  },

  paymob: {
    enabled: process.env.NEXT_PUBLIC_PAYMOB_ENABLED === "true" || process.env.PAYMOB_ENABLED === "true",
    apiKey: process.env.PAYMOB_API_KEY,
    secretKey: process.env.PAYMOB_SECRET_KEY,
    publicKey: process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY || process.env.PAYMOB_PUBLIC_KEY,
    integrationId: process.env.NEXT_PUBLIC_PAYMOB_INTEGRATION_ID || process.env.PAYMOB_INTEGRATION_ID,
    iframeId: process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID || process.env.PAYMOB_IFRAME_ID,
    hmacSecret: process.env.PAYMOB_HMAC_SECRET,
    baseUrl: process.env.NEXT_PUBLIC_PAYMOB_BASE_URL || process.env.PAYMOB_BASE_URL || "https://uae.paymob.com",
  },

  nomod: {
    enabled: process.env.NEXT_PUBLIC_NOMOD_ENABLED === "true" || process.env.NOMOD_ENABLED === "true",
    apiKey: process.env.NOMOD_API_KEY,
    apiUrl: process.env.NEXT_PUBLIC_NOMOD_API_URL || process.env.NOMOD_API_URL || "https://api.nomod.com/v1",
    webhookSecret: process.env.NOMOD_WEBHOOK_SECRET,
  }
};
