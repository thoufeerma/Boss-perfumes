/**
 * Payment-facing strings, resolved per request rather than per build.
 *
 * Tabby's QA flagged that payment-method labels and Tabby's cancel / failure /
 * pre-scoring messages were rendered in English and Arabic at once. These now resolve
 * through one locale, and the same locale is sent as Tabby's `lang` so their hosted
 * checkout matches the language the shopper is reading.
 *
 * Kept free of `server-only` and of async loading on purpose: the payment providers,
 * the API routes and the checkout page all read these synchronously, and the set is
 * small enough that bundling both languages costs nothing. Bulk UI copy lives in
 * ./dictionaries instead, which is server-only and loaded on demand.
 */

import { DEFAULT_LOCALE, type Locale } from "./config";

const dictionaries = {
  en: {
    methods: {
      card: { name: "Credit / Debit Card", description: "Visa • Mastercard" },
      telr: { name: "Secure Payment", description: "Secure UAE Payment Gateway" },
    },
    tabby: {
      methodName: "Pay later with Tabby",
      methodDescription: "",
      notAvailable:
        "Sorry, Tabby is unable to approve this purchase. Please use an alternative payment method for your order.",
      amountTooHigh:
        "This purchase is above your current spending limit with Tabby, try a smaller cart or use another payment method.",
      amountTooLow:
        "The purchase amount is below the minimum amount required to use Tabby, try adding more items or use another payment method.",
      countryUnsupported:
        "Tabby is only available for orders delivered within the United Arab Emirates.",
      currencyUnsupported: "Tabby is not available for orders in this currency.",
      cancelled: "You aborted the payment. Please retry or choose another payment method.",
      sessionRejected: "Tabby rejected the payment session.",
    },
  },
  ar: {
    methods: {
      card: { name: "بطاقة ائتمان / خصم", description: "فيزا • ماستركارد" },
      telr: { name: "دفع آمن", description: "بوابة دفع إماراتية آمنة" },
    },
    tabby: {
      methodName: "ادفع لاحقًا عبر تابي",
      methodDescription: "",
      notAvailable:
        "نأسف، تابي غير قادرة على الموافقة على هذه العملية. الرجاء استخدام طريقة دفع أخرى.",
      amountTooHigh:
        "قيمة الطلب تفوق الحد الأقصى المسموح به حاليًا مع تابي. يُرجى تخفيض قيمة السلة أو استخدام وسيلة دفع أخرى.",
      amountTooLow:
        "قيمة الطلب أقل من الحد الأدنى المسموح به حاليًا مع تابي. يُرجى زيادة قيمة السلة أو استخدام وسيلة دفع أخرى.",
      countryUnsupported: "تابي متاحة فقط للطلبات التي تُسلَّم داخل الإمارات العربية المتحدة.",
      currencyUnsupported: "تابي غير متاحة للطلبات بهذه العملة.",
      cancelled: "لقد ألغيت الدفعة. فضلاً حاول مجددًا أو اختر طريقة دفع أخرى.",
      sessionRejected: "رفضت تابي جلسة الدفع.",
    },
  },
} as const;

export type PaymentMessages = (typeof dictionaries)[Locale];

/** Payment strings for one locale. Unknown locales fall back rather than throwing. */
export function paymentMessages(locale: Locale = DEFAULT_LOCALE): PaymentMessages {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
