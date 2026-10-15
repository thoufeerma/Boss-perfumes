export const metadata = {
  title: "Checkout | Boss Perfumes",
};

import { CheckoutSummary } from "./CheckoutSummary";
import { PaymentFlow } from "@/components/checkout/payment/PaymentFlow";
import { paymentMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const error = params?.error as string;
  const locale = await getLocale();
  const m = paymentMessages(locale).tabby;
  const t = getDictionary(locale);
  let errorMessage: React.ReactNode = null;
  
  if (error === "tabby_cancel") {
    errorMessage = m.cancelled;
  } else if (error === "tabby_failed") {
    errorMessage = m.notAvailable;
  } else if (error) {
    errorMessage = t.checkout.genericPaymentError;
  }

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-8 text-center">{t.checkout.title}</h1>
        
        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

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
