"use client";

import { useCartContext } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";
import { useT, useLocale } from "@/components/i18n/I18nProvider";
import { translateProductName } from "@/lib/i18n/products";

export function CheckoutSummary() {
  const t = useT();
  const locale = useLocale();
  const { cart } = useCartContext();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-brand-surface border border-brand-border p-8 sticky top-32">
        <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6">{t.summary.orderSummary}</h2>
        <div className="text-brand-text-muted text-sm">{t.summary.cartEmpty}</div>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface border border-brand-border p-8 sticky top-32">
      <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6">{t.summary.orderSummary}</h2>
      
      <div className="flex flex-col gap-4 mb-6">
        {cart.items.map((item) => {
          const localizedName = translateProductName(item.name, locale);
          const itemPriceMinor = (item.totals?.line_total && item.totals?.line_total_tax !== undefined)
            ? Math.round((parseInt(item.totals.line_total, 10) + parseInt(item.totals.line_total_tax, 10)) / (item.quantity || 1))
            : parseInt(item.prices.price || "0", 10);

          return (
            <div key={item.key} className="flex justify-between items-start text-brand-text-muted text-sm">
              <span className="flex-1 pe-4">
                {localizedName} <span className="text-xs">x {item.quantity}</span>
              </span>
              <span className="font-medium whitespace-nowrap">
                {formatPrice(itemPriceMinor.toString(), item.prices.currency_code, 10 ** (item.prices.currency_minor_unit || 2))}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="border-t border-brand-border pt-4 flex flex-col gap-2 text-brand-text">
        {cart.totals.total_shipping && parseInt(cart.totals.total_shipping) > 0 && (
          <div className="flex justify-between items-center text-sm text-brand-text-muted">
            <span className="uppercase tracking-wider">{locale === "ar" ? "الشحن" : "Shipping"}</span>
            <span className="font-medium">
              {formatPrice(cart.totals.total_shipping, cart.totals.currency_code, 10 ** (cart.totals.currency_minor_unit || 2))}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="font-medium tracking-widest uppercase text-sm">{t.summary.total}</span>
          <span className="text-xl font-medium">
            {formatPrice(cart.totals.total_price, cart.totals.currency_code, 10 ** (cart.totals.currency_minor_unit || 2))}
          </span>
        </div>
        {cart.totals.total_tax && parseInt(cart.totals.total_tax) > 0 && (
          <div className="text-xs text-brand-text-muted text-end">
            {locale === "ar"
              ? `شامل ${formatPrice(cart.totals.total_tax, cart.totals.currency_code, 10 ** (cart.totals.currency_minor_unit || 2))} ضريبة القيمة المضافة (5%)`
              : `Includes ${formatPrice(cart.totals.total_tax, cart.totals.currency_code, 10 ** (cart.totals.currency_minor_unit || 2))} VAT (5%)`}
          </div>
        )}
      </div>
    </div>
  );
}
