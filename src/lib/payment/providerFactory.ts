import { PaymentProvider } from "./types";
import { CheckoutComProvider } from "./checkoutcom";
import { TelrProvider } from "./telr";
import { TabbyProvider } from "./tabby";
import { paymentConfig } from "./config";
import { getEnabledPaymentMethods } from "./registry";

export function getPaymentProvider(providerId?: string): PaymentProvider {
  // If no providerId passed, fallback to first enabled one, or checkoutcom
  let selectedProvider = providerId;
  
  if (!selectedProvider) {
    const enabledMethods = getEnabledPaymentMethods();
    selectedProvider = enabledMethods.length > 0 ? enabledMethods[0].id : "checkoutcom";
  }

  switch (selectedProvider.toLowerCase()) {
    case "checkoutcom":
      return new CheckoutComProvider();
    case "telr":
      return new TelrProvider();
    case "tabby":
      return new TabbyProvider();
    default:
      throw new Error(`Unsupported payment provider requested: ${selectedProvider}`);
  }
}
