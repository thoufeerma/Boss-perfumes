export const metadata = {
  title: "Checkout | Boss Perfumes",
};

import { CheckoutSummary } from "./CheckoutSummary";
import { PaymentFlow } from "@/components/checkout/payment/PaymentFlow";

export default async function CheckoutPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const error = searchParams.error as string;
  let errorMessage = "";
  
  if (error === "tabby_cancel") {
    errorMessage = "You aborted the payment. Please retry or choose another payment method. / لقد ألغيت الدفعة. فضلاً حاول مجددًا أو اختر طريقة دفع أخرى.";
  } else if (error === "tabby_failed") {
    errorMessage = "Sorry, Tabby is unable to approve this purchase. Please use an alternative payment method for your order. / نأسف، تابي غير قادرة على الموافقة على هذه العملية. الرجاء استخدام طريقة دفع أخرى.";
  } else if (error) {
    errorMessage = "Payment failed. Please try again or use another payment method.";
  }

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-8 text-center">Checkout</h1>
        
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
