"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";

// In a real app, this should come from a context or config, but for simplicity
// we will fetch the config values passed via props or fallback to env vars.
// NOTE: Since this is a client component, we use NEXT_PUBLIC_ variables for fallback
// or pass them explicitly as props from the server component.

interface TabbyPromoProps {
  price: number;
  currency: string;
  source?: "product" | "cart" | "checkout";
  lang?: "en" | "ar";
  publicKey?: string;
  scriptUrl?: string;
}

export function TabbyPromo({ 
  price, 
  currency, 
  source = "product", 
  lang = "en",
  publicKey = process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY || "",
  scriptUrl = process.env.NEXT_PUBLIC_TABBY_PROMO_SCRIPT_URL || "https://checkout.tabby.ai/tabby-promo.js"
}: TabbyPromoProps) {
  const containerId = useRef(`TabbyPromo-${Math.random().toString(36).substr(2, 9)}`);
  
  // We need to initialize the widget once the script is loaded
  const initTabby = () => {
    // @ts-ignore - TabbyPromo is attached to window by the external script
    if (typeof window !== "undefined" && window.TabbyPromo) {
      try {
        // @ts-ignore
        new window.TabbyPromo({
          selector: `#${containerId.current}`,
          currency: currency,
          price: price.toFixed(2),
          installmentsCount: 4,
          lang: lang,
          source: source,
          publicKey: publicKey
        });
      } catch (error) {
        console.error("TabbyPromo initialization failed:", error);
      }
    }
  };

  useEffect(() => {
    // If script is already loaded (e.g. navigation back to this page)
    initTabby();
  }, [price, currency]); // Re-initialize if price changes

  if (!publicKey) {
    return null;
  }

  return (
    <div className="w-full my-4">
      {/* 
        Using strategy="lazyOnload" ensures the widget only loads during idle time,
        improving initial page load performance as requested. 
      */}
      <Script 
        src={scriptUrl}
        strategy="lazyOnload"
        onLoad={initTabby}
      />
      <div id={containerId.current} className="tabby-promo-container min-h-[40px]" />
    </div>
  );
}
