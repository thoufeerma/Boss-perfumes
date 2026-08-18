import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ClearCartEffect } from "./ClearCartEffect";
import { paymentConfig } from "@/lib/payment/config";
import { fetchWC } from "@/api/client";

export const metadata = {
  title: "Order Successful | Boss Perfumes",
};

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const paymentId = searchParams.payment_id as string;
  
  if (paymentId) {
    try {
      // Tabby Verification Fallback (Useful for localhost testing where webhooks are blocked)
      const apiUrl = paymentConfig.tabby.apiUrl || "https://api.tabby.ai/api/v2";
      const res = await fetch(`${apiUrl}/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${paymentConfig.tabby.secretKey}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.status === "AUTHORIZED" || data.status === "CLOSED") {
           console.log(`[Success Page] Tabby payment ${paymentId} is ${data.status}. Awaiting webhook for capture and processing.`);
        } else {
           console.warn(`[Success Page] Tabby payment ${paymentId} has unexpected status: ${data.status}.`);
        }
      }
    } catch (e) {
      console.error("Failed to verify Tabby payment on success page", e);
    }
  }

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
