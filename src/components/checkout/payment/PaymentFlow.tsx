"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MerchantDisclosure } from "./MerchantDisclosure";

export function PaymentFlow() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const billing = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      address_1: formData.get("address") as string,
      city: formData.get("city") as string,
      postcode: formData.get("postcode") as string,
      email: formData.get("email") as string,
      country: "AE", // Defaulting to AE for now or add to form
    };

    try {
      const response = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing, shipping: billing }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to initiate payment");
      }

      if (data.redirectUrl) {
        // Redirect to Checkout.com hosted payment page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No redirect URL returned from payment provider");
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <form className="space-y-12" onSubmit={handleSubmit}>
      <section>
        <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6">Contact Information</h2>
        <input 
          type="email" 
          name="email"
          required
          placeholder="Email" 
          className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors"
        />
      </section>
      
      <section>
        <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6">Shipping Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="first_name" required placeholder="First Name" className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
          <input type="text" name="last_name" required placeholder="Last Name" className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
          <input type="text" name="address" required placeholder="Address" className="col-span-2 w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
          <input type="text" name="city" required placeholder="City" className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
          <input type="text" name="postcode" required placeholder="Postal Code" className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6">Payment</h2>
        <div className="bg-brand-surface border border-brand-border p-6 text-center text-brand-text-muted text-sm mb-6">
          You will be redirected securely to complete your payment.
        </div>
        <MerchantDisclosure />
      </section>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 text-sm border border-red-100">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isProcessing}
        className="w-full bg-brand-text text-white py-4 text-sm font-medium tracking-widest uppercase hover:bg-brand-accent transition-colors duration-300 disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
}
