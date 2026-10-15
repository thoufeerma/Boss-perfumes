"use client";

import { useCartContext } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";
import { useT } from "@/components/i18n/I18nProvider";

export function CheckoutSummary() {
  const t = useT();
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
        {cart.items.map((item) => (
          <div key={item.key} className="flex justify-between items-start text-brand-text-muted text-sm">
            <span className="flex-1 pe-4">
              {item.name} <span className="text-xs">x {item.quantity}</span>
            </span>
            <span className="font-medium whitespace-nowrap">
              {formatPrice(item.prices.price, item.prices.currency_code, 10 ** (item.prices.currency_minor_unit || 2))}
            </span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-brand-border pt-4 flex justify-between items-center text-brand-text">
        <span className="font-medium tracking-widest uppercase text-sm">{t.summary.total}</span>
        <span className="text-xl font-medium">
          {formatPrice(cart.totals.total_price, cart.totals.currency_code, 10 ** (cart.totals.currency_minor_unit || 2))}
        </span>
      </div>
    </div>
  );
}
