import { paymentConfig } from "./config";

export interface PaymentMethodConfig {
  id: string;
  name: string;
  nameAr?: string;
  provider: string;
  enabled: boolean;
  sortOrder: number;
  icon?: string;
  description?: string;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "checkoutcom",
    name: "Credit / Debit Card",
    provider: "Checkout.com",
    enabled: paymentConfig.checkoutcom.enabled,
    sortOrder: 1,
    description: "Visa • Mastercard",
  },
  {
    id: "tabby",
    name: "Pay later with Tabby",
    nameAr: "ادفع لاحقًا عبر تابي",
    provider: "Tabby",
    enabled: paymentConfig.tabby.enabled,
    sortOrder: 2,
    description: "Split your payment into 4 interest-free installments",
  },
  {
    id: "telr",
    name: "Secure Payment",
    provider: "Telr",
    enabled: paymentConfig.telr.enabled,
    sortOrder: 3,
    description: "Secure UAE Payment Gateway",
  },
];

export const getEnabledPaymentMethods = () => {
  return PAYMENT_METHODS.filter((method) => method.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
};
