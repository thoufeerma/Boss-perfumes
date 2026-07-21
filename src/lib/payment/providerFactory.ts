import { PaymentProvider } from "./types";
import { CheckoutComProvider } from "./checkoutcom";
import { TelrProvider } from "./telr";
import { paymentConfig } from "./config";

export function getPaymentProvider(providerId?: string): PaymentProvider {
  const selectedProvider = providerId || paymentConfig.provider;

  switch (selectedProvider.toLowerCase()) {
    case "checkoutcom":
      return new CheckoutComProvider();
    case "telr":
      return new TelrProvider();
    default:
      throw new Error(`Unsupported payment provider requested: ${selectedProvider}`);
  }
}
