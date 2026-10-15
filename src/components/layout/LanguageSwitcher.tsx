"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/config";

const LABELS: Record<Locale, string> = {
  en: "EN",
  ar: "عربي",
};

/**
 * Switches the storefront language.
 *
 * The choice is stored in an httpOnly cookie by /api/locale, so the server decides the
 * language on the next render - which is what makes `<html lang>` / `dir` and Tabby's
 * `lang` parameter agree with what the shopper is reading. router.refresh() re-renders
 * the current route without a full navigation, so cart and scroll position survive.
 */
export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Locale>(current);

  async function choose(locale: Locale) {
    if (locale === optimistic) return;
    setOptimistic(locale);

    try {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (!res.ok) throw new Error("Failed to set locale");
      startTransition(() => router.refresh());
    } catch {
      setOptimistic(current); // Put the control back where it was.
    }
  }

  return (
    <div
      className="flex items-center text-xs tracking-widest uppercase"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 && <span aria-hidden className="mx-1.5 text-brand-border">/</span>}
          <button
            type="button"
            onClick={() => choose(locale)}
            disabled={isPending}
            aria-current={optimistic === locale ? "true" : undefined}
            lang={locale}
            className={
              optimistic === locale
                ? "text-brand-text font-medium disabled:opacity-60"
                : "text-brand-text-muted hover:text-brand-text transition-colors disabled:opacity-60"
            }
          >
            {LABELS[locale]}
          </button>
        </span>
      ))}
    </div>
  );
}
