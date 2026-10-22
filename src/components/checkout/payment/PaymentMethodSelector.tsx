"use client";

import { useEffect, useState } from "react";
import { PaymentMethodConfig } from "@/lib/payment/registry";
import { TabbyCard } from "@/components/payment/TabbyCard";
import Image from "next/image";
import { useT, useLocale } from "@/components/i18n/I18nProvider";
import { paymentMessages } from "@/lib/i18n/messages";

interface PaymentMethodSelectorProps {
  cartData: any; // Ideally typed according to your cart state
  billingData?: any;
  selectedMethod: string;
  onSelect: (methodId: string) => void;
}

export function PaymentMethodSelector({ cartData, billingData, selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  const t = useT();
  const locale = useLocale();
  const [availableMethods, setAvailableMethods] = useState<(PaymentMethodConfig & { eligible: boolean, reason?: string })[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // If country is explicitly not UAE, Tabby must be hidden completely
  const clientCountry = String(billingData?.country || "").trim().toUpperCase();
  const isExplicitNonUAE = clientCountry !== "" && clientCountry !== "AE";

  // Filter methods: when a non-UAE country is selected, Tabby is hidden
  const visibleMethods = availableMethods.filter((method) => {
    if (method.id === "tabby") {
      if (isExplicitNonUAE) return false;
      if (!method.eligible && method.reason === paymentMessages(locale).tabby.countryUnsupported) {
        return false;
      }
    }
    return true;
  });

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
            // Country drives market availability (Tabby is UAE-only), so it has to
            // reach the server-side eligibility check.
            country: billingData?.country || cartData.billing_address?.country,
          }
        } : cartData;

        const res = await fetch("/api/payment/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartData: enhancedCartData, locale })
        });
        if (!res.ok) throw new Error("API failed");
        
        const data = await res.json();
        const methodsWithEligibility = data.methods || [];
        
        setAvailableMethods(methodsWithEligibility);

        const currentVisible = methodsWithEligibility.filter((m: any) => {
          if (m.id === "tabby") {
            if (isExplicitNonUAE) return false;
            if (!m.eligible && m.reason === paymentMessages(locale).tabby.countryUnsupported) return false;
          }
          return true;
        });

        const firstEligible = currentVisible.find((m: any) => m.eligible);
        const selectedIsEligible = currentVisible.find((m: any) => m.id === selectedMethod)?.eligible;
        
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
  }, [cartData, billingData?.email, billingData?.phone, billingData?.country, locale]);

  useEffect(() => {
    const isTabbyVisible = visibleMethods.some(m => m.id === "tabby");
    if (!isTabbyVisible && selectedMethod === "tabby") {
      const alt = visibleMethods.find(m => m.eligible)?.id || "checkoutcom";
      onSelect(alt);
    }
  }, [visibleMethods, selectedMethod, onSelect]);

  if (visibleMethods.length === 0) {
    return <div className="text-red-500 text-sm">{t.checkout.noPaymentMethods}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-4">{t.checkout.paymentMethod}</h2>
      
      <div className="flex flex-col gap-3">
        {visibleMethods.map((method) => {
          return (
            <div 
              key={method.id} 
              className={`
                p-4 border transition-colors duration-200 w-full max-w-full overflow-hidden
                ${!method.eligible ? "opacity-50 bg-brand-surface cursor-not-allowed border-brand-border" : 
                  selectedMethod === method.id 
                    ? "border-brand-text bg-brand-bg-secondary cursor-pointer" 
                    : "border-brand-border bg-brand-surface hover:border-brand-text-muted cursor-pointer"
                }
              `}
              onClick={() => {
                if (method.eligible) onSelect(method.id);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => {
                      if (method.eligible) onSelect(method.id);
                    }}
                    disabled={!method.eligible}
                    className="w-4 h-4 text-brand-text border-brand-border focus:ring-brand-accent focus:ring-1 accent-brand-text disabled:opacity-50 flex-shrink-0 cursor-pointer"
                  />
                  <span className="font-medium text-sm text-brand-text uppercase tracking-wide truncate">
                    {method.name}
                  </span>
                </div>
                
                {/* Visual Indicators/Logos */}
                <div className="flex gap-2 items-center flex-shrink-0 ms-2">
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
                <div className="mt-3 w-full min-w-0 max-w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <TabbyCard 
                    price={parseFloat(cartData.totals.total_price || "0") / (10 ** (cartData.totals.currency_minor_unit || 2))} 
                    currency={cartData.totals.currency_code || "AED"} 
                    lang={locale}
                  />
                </div>
              )}
              
              {method.description ? (
                <p className="text-xs text-brand-text-muted mt-2 ps-7">{method.description}</p>
              ) : null}
              
              {!method.eligible && method.reason && (
                <p className="text-xs text-red-500 mt-2 font-medium whitespace-pre-line ps-7">{method.reason}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
