import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ClearCartEffect } from "./ClearCartEffect";

export const metadata = {
  title: "Order Successful | Boss Perfumes",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen flex items-center justify-center">
      <ClearCartEffect />
      <div className="mx-auto max-w-2xl bg-brand-surface border border-brand-border p-12 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-4">Payment Successful</h1>
        <p className="text-brand-text-muted mb-8">
          Thank you for your order. We have received your payment and are now processing your purchase.
        </p>
        <Link 
          href="/account/orders" 
          className="inline-block bg-brand-text text-white py-4 px-8 text-sm font-medium tracking-widest uppercase hover:bg-brand-accent transition-colors duration-300"
        >
          View Your Orders
        </Link>
      </div>
    </div>
  );
}
