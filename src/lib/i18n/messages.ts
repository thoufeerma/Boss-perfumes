/**
 * Single source of truth for the language the storefront speaks.
 *
 * Tabby's QA flagged that payment-method labels and Tabby's cancel / failure /
 * pre-scoring messages were rendered in English and Arabic at once, on a site that
 * has no language switcher. Everything customer-facing that relates to Tabby now
 * resolves through here, so exactly one language is shown and the same value is
 * sent as Tabby's `lang` parameter.
 *
 * The Arabic column is kept deliberately: UAE consumer protection rules
 * (Federal Law 15/2020 and Cabinet Decision 66/2023) require Arabic on
 * e-commerce sites, so this is the seed for real bilingual support rather than
 * something to be deleted. Flip NEXT_PUBLIC_SITE_LOCALE once Arabic is complete.
 */

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

function resolveLocale(): Locale {
  const configured = process.env.NEXT_PUBLIC_SITE_LOCALE;
  return LOCALES.includes(configured as Locale) ? (configured as Locale) : "en";
}

/** The one language the storefront currently presents. */
export const SITE_LOCALE: Locale = resolveLocale();

const dictionaries = {
  en: {
    tabby: {
      methodName: "Pay later with Tabby",
      methodDescription: "Split your payment into 4 interest-free installments",
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
    tabby: {
      methodName: "ادفع لاحقًا عبر تابي",
      methodDescription: "قسّم مدفوعاتك على 4 أقساط بدون فوائد",
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

/** Messages for the active locale. */
export const messages = dictionaries[SITE_LOCALE];
