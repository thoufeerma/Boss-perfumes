"use client";

import Link from "next/link";
import { PaymentMethods } from "@/components/common/PaymentMethods";
import { useT } from "@/components/i18n/I18nProvider";

// Rendered from PaymentFlow, which is a client component, so this reads the dictionary
// from context rather than resolving the locale on the server.
export function MerchantDisclosure() {
  const t = useT();

  return (
    <div className="bg-brand-surface border border-brand-border p-6 mb-8 text-sm text-brand-text-muted space-y-4">
      <div>
        <PaymentMethods />
      </div>

      <div className="border-t border-brand-border pt-4 text-xs">
        <p className="mb-2">{t.merchant.policiesIntro}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/terms" className="hover:text-brand-text underline transition-colors">{t.policies.terms}</Link>
          <Link href="/privacy" className="hover:text-brand-text underline transition-colors">{t.policies.privacy}</Link>
          <Link href="/refund" className="hover:text-brand-text underline transition-colors">{t.policies.refund}</Link>
          <Link href="/shipping" className="hover:text-brand-text underline transition-colors">{t.policies.shipping}</Link>
        </div>
      </div>
    </div>
  );
}
