"use client";

import { PaymentMethods } from "./PaymentMethods";
import { useT } from "@/components/i18n/I18nProvider";

export function MerchantInformation({ className = "" }: { className?: string }) {
  const t = useT();

  return (
    <div className={`text-sm text-brand-text-muted space-y-6 ${className}`}>
      <div>
        <h4 className="font-medium text-brand-text uppercase tracking-widest mb-2">{t.merchant.companyInformation}</h4>
        <p className="font-medium text-brand-text">{t.merchant.companyName}</p>
        {t.merchant.addressLines.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>

      <div>
        <h4 className="font-medium text-brand-text uppercase tracking-widest mb-2">{t.merchant.contactUs}</h4>
        <p>{t.merchant.email} <a href="mailto:brbossperfumes@gmail.com" className="hover:text-brand-text transition-colors">brbossperfumes@gmail.com</a></p>
        <p>Phone: +971 4 235 6130 / +971 4 3983968</p>
      </div>

      <div>
        <h4 className="font-medium text-brand-text uppercase tracking-widest mb-2">{t.merchant.businessHours}</h4>
        <p>{t.merchant.hoursWeekdays}</p>
        <p>{t.merchant.hoursSunday}</p>
      </div>

      <div>
        <h4 className="font-medium text-brand-text uppercase tracking-widest mb-2">{t.merchant.currencyAndPayments}</h4>
        <p className="mb-3">{t.merchant.priceNotice}</p>
        <PaymentMethods />
      </div>
    </div>
  );
}
