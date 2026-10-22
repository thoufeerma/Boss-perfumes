"use client";

import React, { useEffect, useId } from "react";
import Script from "next/script";

import { useLocale } from "@/components/i18n/I18nProvider";

declare global {
  interface Window {
    TabbyCard?: new (options: Record<string, unknown>) => unknown;
  }
}

interface TabbyCardProps {
  price: number;
  currency: string;
  lang?: "en" | "ar";
  publicKey?: string;
}

export function TabbyCard({ 
  price, 
  currency, 
  lang,
  publicKey = process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY || "",
}: TabbyCardProps) {
  const currentLocale = useLocale();
  const effectiveLang = lang || currentLocale;
  const reactId = useId();
  const containerId = `TabbyCard-${reactId.replace(/:/g, '')}`;
  const scriptUrl = "https://checkout.tabby.ai/tabby-card.js";
  
  const initTabby = () => {
    if (typeof window !== "undefined" && window.TabbyCard) {
      try {
        const decimalPlaces = ['KWD', 'BHD', 'OMR'].includes(currency.toUpperCase()) ? 3 : 2;

        new window.TabbyCard({
          selector: `#${containerId}`,
          currency: currency,
          price: price.toFixed(decimalPlaces),
          lang: effectiveLang,
          publicKey: publicKey,
          merchantCode: process.env.NEXT_PUBLIC_TABBY_MERCHANT_CODE || ""
        });
      } catch (error) {
        console.error("TabbyCard initialization failed:", error);
      }
    }
  };

  useEffect(() => {
    initTabby();
  }, [price, currency, effectiveLang]);

  if (!publicKey) return null;

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden my-2">
      <Script 
        src={scriptUrl}
        strategy="afterInteractive"
        onLoad={initTabby}
      />
      <div 
        id={containerId} 
        className="tabby-card-container w-full max-w-full min-w-0 min-h-[40px]" 
      />
    </div>
  );
}
