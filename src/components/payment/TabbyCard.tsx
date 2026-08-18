"use client";

import React, { useEffect, useId } from "react";
import Script from "next/script";

interface TabbyCardProps {
  price: number;
  currency: string;
  lang?: "en" | "ar";
  publicKey?: string;
}

export function TabbyCard({ 
  price, 
  currency, 
  lang = "en",
  publicKey = process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY || "",
}: TabbyCardProps) {
  const reactId = useId();
  const containerId = `TabbyCard-${reactId.replace(/:/g, '')}`;
  const scriptUrl = "https://checkout.tabby.ai/tabby-card.js";
  
  const initTabby = () => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.TabbyCard) {
      try {
        const decimalPlaces = ['KWD', 'BHD', 'OMR'].includes(currency.toUpperCase()) ? 3 : 2;

        // @ts-ignore
        new window.TabbyCard({
          selector: `#${containerId}`,
          currency: currency,
          price: price.toFixed(decimalPlaces),
          lang: lang,
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
  }, [price, currency]);

  if (!publicKey) return null;

  return (
    <div className="w-full my-4">
      <Script 
        src={scriptUrl}
        strategy="afterInteractive"
        onLoad={initTabby}
      />
      <div id={containerId} className="tabby-card-container min-h-[40px]" />
    </div>
  );
}
