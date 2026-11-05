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
  } else if (error === "paymob_cancel" || error === "paymob_failed") {
    errorMessage = "Paymob transaction was not completed or declined. Please choose a payment method and try again.";
  } else if (error === "nomod_cancel" || error === "nomod_failed") {
    errorMessage = "Nomod transaction was not completed or declined. Please choose a payment method and try again.";
  } else if (error) {
    errorMessage = t.checkout.genericPaymentError;
  }

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-10 text-center">{t.checkout.title}</h1>
        
        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start">
          <div className="lg:col-span-7 xl:col-span-7">
            <PaymentFlow />
          </div>

          <div className="lg:col-span-5 xl:col-span-5">
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
