import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata = {
  title: "Order Failed | Boss Perfumes",
};

export default function CheckoutFailedPage() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen flex items-center justify-center">
      <div className="mx-auto max-w-2xl bg-brand-surface border border-brand-border p-12 text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-4">Payment Failed</h1>
        <p className="text-brand-text-muted mb-8">
          Unfortunately, your payment could not be processed. Please try again with a different payment method.
        </p>
        <Link 
          href="/checkout" 
          className="inline-block bg-brand-text text-white py-4 px-8 text-sm font-medium tracking-widest uppercase hover:bg-brand-accent transition-colors duration-300"
        >
          Return to Checkout
        </Link>
      </div>
    </div>
  );
}
