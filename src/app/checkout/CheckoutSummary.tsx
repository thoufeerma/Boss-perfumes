"use client";

import Image from "next/image";
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
      <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 sticky top-32">
        <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6">
          {t.summary.orderSummary}
        </h2>
        <div className="text-brand-text-muted text-sm">{t.summary.cartEmpty}</div>
      </div>
    );
  }

  const currency = cart.totals.currency_code || "AED";
  const divisor = 10 ** (cart.totals.currency_minor_unit ?? 2);
  const totalTaxMinor = parseInt(cart.totals.total_tax || "0", 10);
  const totalShippingMinor = parseInt(cart.totals.total_shipping || "0", 10);
  const totalDiscountMinor = parseInt(cart.totals.total_discount || "0", 10);

  // Subtotal (excl. VAT)
  const totalItemsMinor = cart.totals.total_items
    ? parseInt(cart.totals.total_items, 10)
    : Math.max(0, parseInt(cart.totals.total_price || "0", 10) - totalTaxMinor - totalShippingMinor);

  return (
    <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 sticky top-32 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
        <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text">
          {t.summary.orderSummary}
        </h2>
        <span className="text-xs text-brand-text-muted">
          {locale === "ar"
            ? `${cart.items.reduce((acc, it) => acc + (it.quantity || 1), 0)} عناصر`
            : `${cart.items.reduce((acc, it) => acc + (it.quantity || 1), 0)} items`}
        </span>
      </div>

      {/* Cart Items List */}
      <div className="flex flex-col divide-y divide-brand-border/40 mb-6">
        {cart.items.map((item) => {
          const localizedName = translateProductName(item.name, locale);
          const qty = Math.max(1, item.quantity || 1);
          const itemDivisor = 10 ** (item.prices.currency_minor_unit ?? 2);
          const itemCurrency = item.prices.currency_code || currency;

          // Line totals (net, tax, gross)
          let lineNetMinor = 0;
          let lineTaxMinor = 0;
          let lineGrossMinor = 0;

          if (item.totals?.line_total !== undefined && item.totals?.line_total_tax !== undefined) {
            lineNetMinor = parseInt(item.totals.line_total, 10);
            lineTaxMinor = parseInt(item.totals.line_total_tax, 10);
            lineGrossMinor = lineNetMinor + lineTaxMinor;
          } else {
            const unitGrossMinor = parseInt(item.prices.price || "0", 10);
            lineGrossMinor = unitGrossMinor * qty;
            lineNetMinor = Math.round(lineGrossMinor / 1.05);
            lineTaxMinor = lineGrossMinor - lineNetMinor;
          }

          // Per-unit values
          const unitGrossMinor = Math.round(lineGrossMinor / qty);
          const unitNetMinor = Math.round(lineNetMinor / qty);
          const unitTaxMinor = Math.round(lineTaxMinor / qty);

          const imageSrc = item.images?.[0]?.src || "/images/product-placeholder.png";

          return (
            <div key={item.key} className="flex gap-4 items-start py-4 first:pt-0 last:pb-0">
              {/* Product Thumbnail with floating quantity badge */}
              <div className="relative flex-shrink-0">
                <div className="relative w-16 h-20 bg-brand-bg-secondary border border-brand-border/60 rounded-xs overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={localizedName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                {qty > 1 && (
                  <span
                    className="absolute -top-1.5 -end-1.5 bg-brand-text text-white text-[11px] font-semibold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-xs z-10"
                    aria-label={`Quantity: ${qty}`}
                  >
                    {qty}
                  </span>
                )}
              </div>

              {/* Product Details & Tax Breakdown */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="font-serif text-sm font-medium text-brand-text leading-snug">
                      {localizedName}
                    </h3>
                    {qty > 1 && (
                      <div className="text-xs text-brand-text-muted mt-0.5">
                        {locale === "ar"
                          ? `${qty} × ${formatPrice(unitGrossMinor, itemCurrency, itemDivisor)}`
                          : `${qty} × ${formatPrice(unitGrossMinor, itemCurrency, itemDivisor)}`}
                      </div>
                    )}
                  </div>
                  <div className="text-end flex-shrink-0">
                    <span className="font-medium text-brand-text text-sm whitespace-nowrap">
                      {formatPrice(lineGrossMinor, itemCurrency, itemDivisor)}
                    </span>
                  </div>
                </div>

                {/* Per-item VAT breakdown: Each on its own dedicated clean line */}
                <div className="mt-2 pt-1.5 border-t border-brand-border/30 text-[11px] text-brand-text-muted flex flex-col gap-1">
                  <div className="whitespace-nowrap">
                    <span>{locale === "ar" ? "غير شامل الضريبة:" : "Excl. VAT:"}</span>{" "}
                    <span className="font-medium text-brand-text">
                      {formatPrice(qty > 1 ? lineNetMinor : unitNetMinor, itemCurrency, itemDivisor)}
                    </span>
                    {qty > 1 && (
                      <span className="text-brand-text-muted ms-1">
                        ({formatPrice(unitNetMinor, itemCurrency, itemDivisor)} {locale === "ar" ? "للقطعة" : "ea"})
                      </span>
                    )}
                  </div>
                  <div className="whitespace-nowrap">
                    <span>{locale === "ar" ? "ضريبة القيمة المضافة (5%):" : "5% VAT:"}</span>{" "}
                    <span className="font-medium text-brand-text">
                      {formatPrice(qty > 1 ? lineTaxMinor : unitTaxMinor, itemCurrency, itemDivisor)}
                    </span>
                    {qty > 1 && (
                      <span className="text-brand-text-muted ms-1">
                        ({formatPrice(unitTaxMinor, itemCurrency, itemDivisor)} {locale === "ar" ? "للقطعة" : "ea"})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals Section */}
      <div className="border-t border-brand-border pt-4 flex flex-col gap-2.5 text-brand-text text-sm">
        {/* Subtotal (excl. VAT) */}
        <div className="flex justify-between items-center text-brand-text-muted">
          <span>{locale === "ar" ? "المجموع الفرعي (غير شامل الضريبة)" : "Subtotal (excl. VAT)"}</span>
          <span className="font-medium text-brand-text">
            {formatPrice(totalItemsMinor, currency, divisor)}
          </span>
        </div>

        {/* VAT (5%) */}
        {totalTaxMinor > 0 && (
          <div className="flex justify-between items-center text-brand-text-muted">
            <span>{locale === "ar" ? "ضريبة القيمة المضافة (5%)" : "VAT (5%)"}</span>
            <span className="font-medium text-brand-text">
              {formatPrice(totalTaxMinor, currency, divisor)}
            </span>
          </div>
        )}

        {/* Discount (if applicable) */}
        {totalDiscountMinor > 0 && (
          <div className="flex justify-between items-center text-emerald-700">
            <span>{locale === "ar" ? "الخصم" : "Discount"}</span>
            <span className="font-medium">
              -{formatPrice(totalDiscountMinor, currency, divisor)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between items-center text-brand-text-muted">
          <span>{locale === "ar" ? "الشحن" : "Shipping"}</span>
          <span className="font-medium text-brand-text">
            {totalShippingMinor > 0
              ? formatPrice(totalShippingMinor, currency, divisor)
              : cart.totals.total_shipping === null
              ? (locale === "ar" ? "يُحسب عند إدخال العنوان" : "Calculated at checkout")
              : (locale === "ar" ? "مجاني" : "Free")}
          </span>
        </div>

        <div className="border-t border-brand-border my-1" />

        {/* Final Total - Consistent sans font matching above prices */}
        <div className="flex justify-between items-baseline">
          <span className="font-medium tracking-widest uppercase text-sm text-brand-text">{t.summary.total}</span>
          <span className="text-xl sm:text-2xl font-semibold tracking-tight text-brand-text">
            {formatPrice(cart.totals.total_price, currency, divisor)}
          </span>
        </div>

        {/* Final VAT Note */}
        {totalTaxMinor > 0 && (
          <div className="text-xs text-brand-text-muted text-end">
            {locale === "ar"
              ? `شامل ${formatPrice(totalTaxMinor, currency, divisor)} ضريبة القيمة المضافة (5%)`
              : `Includes ${formatPrice(totalTaxMinor, currency, divisor)} VAT (5%)`}
          </div>
        )}
      </div>
    </div>
  );
}
