"use client";

import { useEffect, useState } from "react";
import { getEnabledPaymentMethods, PaymentMethodConfig } from "@/lib/payment/registry";
import { getPaymentProvider } from "@/lib/payment/providerFactory";
import { TabbyPromo } from "@/components/payment/TabbyPromo";

interface PaymentMethodSelectorProps {
  cartData: any; // Ideally typed according to your cart state
  selectedMethod: string;
  onSelect: (methodId: string) => void;
}

export function PaymentMethodSelector({ cartData, selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  const [availableMethods, setAvailableMethods] = useState<(PaymentMethodConfig & { eligible: boolean, reason?: string })[]>([]);

  useEffect(() => {
    // Determine eligibility for all enabled methods
    const enabledMethods = getEnabledPaymentMethods();
    
    const methodsWithEligibility = enabledMethods.map((method) => {
      try {
        const provider = getPaymentProvider(method.id);
        const check = provider.isEligible(cartData);
        return { ...method, eligible: check.eligible, reason: check.reason };
      } catch (e) {
        return { ...method, eligible: false, reason: "Internal error" };
      }
    });

    setAvailableMethods(methodsWithEligibility);

    // If current selected method is not eligible, fallback to first eligible
    const firstEligible = methodsWithEligibility.find(m => m.eligible);
    const selectedIsEligible = methodsWithEligibility.find(m => m.id === selectedMethod)?.eligible;
    
    if (!selectedIsEligible && firstEligible) {
      onSelect(firstEligible.id);
    }
  }, [cartData]);

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
                <div className="flex gap-2">
                  {method.id === "checkoutcom" && (
                    <span className="text-xs text-brand-text-muted border px-1 border-brand-border uppercase tracking-widest">Visa / MC</span>
                  )}
                  {method.id === "tabby" && (
                    <span className="text-xs text-brand-text-muted font-bold tracking-widest uppercase bg-[#3EFFB6] text-black px-2 py-0.5 rounded-sm">Tabby</span>
                  )}
                  {method.id === "telr" && (
                    <span className="text-xs text-brand-text-muted border px-1 border-brand-border uppercase tracking-widest">Telr</span>
                  )}
                </div>
              </div>

              {method.id === "tabby" && method.eligible && cartData?.totals && (
                <div className="mt-2 mb-1" onClick={(e) => e.stopPropagation()}>
                  <TabbyPromo 
                    price={parseFloat(cartData.totals.total_price || "0") / (10 ** (cartData.totals.currency_minor_unit || 2))} 
                    currency={cartData.totals.currency_code || "AED"} 
                    source="checkout" 
                  />
                </div>
              )}
              
              {method.description && (
                <p className="text-xs text-brand-text-muted mt-1">{method.description}</p>
              )}
              
              {!method.eligible && method.reason && (
                <p className="text-xs text-red-500 mt-2 font-medium">{method.reason}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
