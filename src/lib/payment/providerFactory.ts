import { PaymentProvider } from "./types";
import { CheckoutComProvider } from "./checkoutcom";
import { TelrProvider } from "./telr";
import { TabbyProvider } from "./tabby";
import { WooPaymentsProvider } from "./woopayments";
import { PaymobProvider } from "./paymob";
import { NomodProvider } from "./nomod";
import { paymentConfig } from "./config";
import { getEnabledPaymentMethods } from "./registry";

export function getPaymentProvider(providerId?: string): PaymentProvider {
  // If no providerId passed, fallback to first enabled one, or woopayments
  let selectedProvider = providerId;
  
  if (!selectedProvider) {
    const enabledMethods = getEnabledPaymentMethods();
    selectedProvider = enabledMethods.length > 0 ? enabledMethods[0].id : "woopayments";
  }

  switch (selectedProvider.toLowerCase()) {
    case "checkoutcom":
      return new CheckoutComProvider();
    case "woopayments":
    case "woocommerce":
      return new WooPaymentsProvider();
    case "telr":
      return new TelrProvider();
    case "tabby":
      return new TabbyProvider();
    case "paymob":
      return new PaymobProvider();
    case "nomod":
      return new NomodProvider();
    default:
      throw new Error(`Unsupported payment provider requested: ${selectedProvider}`);
  }
}
