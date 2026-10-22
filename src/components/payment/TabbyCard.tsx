"use client";

import React, { useEffect, useId, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const injectResponsiveStyles = () => {
    if (!containerRef.current) return;
    
    const applyShadowStyles = (root: ShadowRoot) => {
      if (root.querySelector("#tabby-responsive-fix")) return;
      const style = document.createElement("style");
      style.id = "tabby-responsive-fix";
      style.textContent = `
        :host, .container, [class*="styles__container"], [class*="container"] {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 12px !important;
          overflow: hidden !important;
        }
        [class*="PaymentOptionSummary"] {
          min-width: 0 !important;
          max-width: 100% !important;
          flex: 1 1 180px !important;
        }
        [class*="OptionList"] {
          min-width: 0 !important;
          max-width: 100% !important;
          flex: 1 1 140px !important;
        }
      `;
      root.appendChild(style);
    };

    const elements = containerRef.current.querySelectorAll("*");
    elements.forEach((el) => {
      if (el.shadowRoot) {
        applyShadowStyles(el.shadowRoot);
      }
    });
  };

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

        setTimeout(injectResponsiveStyles, 50);
        setTimeout(injectResponsiveStyles, 300);
        setTimeout(injectResponsiveStyles, 1000);
      } catch (error) {
        console.error("TabbyCard initialization failed:", error);
      }
    }
  };

  useEffect(() => {
    initTabby();
  }, [price, currency, effectiveLang]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new MutationObserver(() => {
      injectResponsiveStyles();
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!publicKey) return null;

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden my-2">
      <Script 
        src={scriptUrl}
        strategy="afterInteractive"
        onLoad={initTabby}
      />
      <div 
        ref={containerRef}
        id={containerId} 
        className="tabby-card-container w-full max-w-full min-w-0 overflow-hidden min-h-[40px]" 
      />
    </div>
  );
}
