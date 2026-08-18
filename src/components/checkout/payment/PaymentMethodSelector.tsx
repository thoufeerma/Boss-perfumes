"use client";

import { useEffect, useState } from "react";
import { PaymentMethodConfig } from "@/lib/payment/registry";
import { TabbyPromo } from "@/components/payment/TabbyPromo";
import { TabbyCard } from "@/components/payment/TabbyCard";
import Image from "next/image";

interface PaymentMethodSelectorProps {
  cartData: any; // Ideally typed according to your cart state
  billingData?: any;
  selectedMethod: string;
  onSelect: (methodId: string) => void;
}

export function PaymentMethodSelector({ cartData, billingData, selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  const [availableMethods, setAvailableMethods] = useState<(PaymentMethodConfig & { eligible: boolean, reason?: string })[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEligibility() {
      setIsLoading(true);
      try {
        const enhancedCartData = cartData ? {
          ...cartData,
          billing_address: {
            ...cartData.billing_address,
            email: billingData?.email || cartData.billing_address?.email,
            phone: billingData?.phone || cartData.billing_address?.phone,
          }
        } : cartData;

        const res = await fetch("/api/payment/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartData: enhancedCartData })
        });
        if (!res.ok) throw new Error("API failed");
        
        const data = await res.json();
        const methodsWithEligibility = data.methods || [];
        
        setAvailableMethods(methodsWithEligibility);

        const firstEligible = methodsWithEligibility.find((m: any) => m.eligible);
        const selectedIsEligible = methodsWithEligibility.find((m: any) => m.id === selectedMethod)?.eligible;
        
        if (!selectedIsEligible && firstEligible) {
          onSelect(firstEligible.id);
        }
      } catch (err) {
        console.error("Eligibility fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (cartData) {
      const timer = setTimeout(() => {
        fetchEligibility();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartData, billingData?.email, billingData?.phone]);

  if (availableMethods.length === 0) {
    return <div className="text-red-500 text-sm">No payment methods available for this order.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-4">Payment Method</h2>
      
      <div className="flex flex-col gap-3">
        {availableMethods.map((method) => (
          <label 
            key={method.id} 
            className={`
              flex items-center p-4 border transition-colors duration-200
              ${!method.eligible ? "opacity-50 bg-brand-surface cursor-not-allowed border-brand-border" : 
                selectedMethod === method.id 
                  ? "border-brand-text bg-brand-bg-secondary cursor-pointer" 
                  : "border-brand-border bg-brand-surface hover:border-brand-text-muted cursor-pointer"
              }
            `}
            onClick={(e) => {
              if (!method.eligible) {
                e.preventDefault();
              }
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => {
                if (method.eligible) onSelect(method.id);
              }}
              disabled={!method.eligible}
              className="w-4 h-4 text-brand-text border-brand-border focus:ring-brand-accent focus:ring-1 accent-brand-text disabled:opacity-50"
            />
            
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-brand-text uppercase tracking-wide">
                  {method.name}
                </span>
                
                {/* Visual Indicators/Logos could go here based on method.id */}
                <div className="flex gap-2 items-center">
                  {method.id === "checkoutcom" && (
                    <span className="text-xs text-brand-text-muted border px-1 border-brand-border uppercase tracking-widest">Visa / MC</span>
                  )}
                  {method.id === "telr" && (
                    <span className="text-xs text-brand-text-muted border px-1 border-brand-border uppercase tracking-widest">Telr</span>
                  )}
                  {method.id === "tabby" && (
                    <Image 
                      src="/tabby logos/Tabby_Badge/Tabby_Badge_SVG.svg" 
                      alt="Tabby" 
                      width={56} 
                      height={20} 
                      className="object-contain" 
                    />
                  )}
                </div>
              </div>

              {method.id === "tabby" && method.eligible && cartData?.totals && (
                <div className="mt-2 mb-1" onClick={(e) => e.stopPropagation()}>
                  <TabbyCard 
                    price={parseFloat(cartData.totals.total_price || "0") / (10 ** (cartData.totals.currency_minor_unit || 2))} 
                    currency={cartData.totals.currency_code || "AED"} 
                  />
                </div>
              )}
              
              {method.description && (
                <p className="text-xs text-brand-text-muted mt-1">{method.description}</p>
              )}
              
              {!method.eligible && method.reason && (
                <p className="text-xs text-red-500 mt-2 font-medium whitespace-pre-line">{method.reason}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
