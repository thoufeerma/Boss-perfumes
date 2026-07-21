export const metadata = {
  title: "Checkout | Boss Perfumes",
};

import { CheckoutSummary } from "./CheckoutSummary";
import { PaymentFlow } from "@/components/checkout/payment/PaymentFlow";

export default function CheckoutPage() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="w-full lg:w-2/3">
            <PaymentFlow />
          </div>

          <div className="w-full lg:w-1/3">
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
