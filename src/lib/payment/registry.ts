import { paymentConfig } from "./config";
import { paymentMessages } from "@/lib/i18n/messages";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

export interface PaymentMethodConfig {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  sortOrder: number;
  icon?: string;
  description?: string;
}

/**
 * The configured methods, with labels in the given language.
 *
 * A function rather than a constant because the shopper picks the language per request,
 * so the labels cannot be fixed at module load.
 */
export function paymentMethods(locale: Locale = DEFAULT_LOCALE): PaymentMethodConfig[] {
  const m = paymentMessages(locale);

  return [
    {
      id: "woopayments",
      name: m.methods.woopayments.name,
      provider: "WooPayments",
      enabled: paymentConfig.woopayments.enabled,
      sortOrder: 1,
      description: m.methods.woopayments.description,
    },
    {
      id: "tabby",
      name: m.tabby.methodName,
      provider: "Tabby",
      enabled: paymentConfig.tabby.enabled,
      sortOrder: 2,
      description: "",
    },
    {
      id: "paymob",
      name: (m.methods as any).paymob?.name || "Credit / Debit Card (Paymob)",
      provider: "Paymob",
      enabled: paymentConfig.paymob.enabled,
      sortOrder: 3,
      description: (m.methods as any).paymob?.description || "Cards & Apple Pay via Paymob",
    },
    {
      id: "nomod",
      name: (m.methods as any).nomod?.name || "Nomod (Cards, Apple Pay)",
      provider: "Nomod",
      enabled: paymentConfig.nomod.enabled,
      sortOrder: 4,
      description: (m.methods as any).nomod?.description || "Cards, Apple Pay & Google Pay via Nomod",
    },
  ];
}

export const getEnabledPaymentMethods = (locale: Locale = DEFAULT_LOCALE) => {
  return paymentMethods(locale)
    .filter((method) => method.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};
