/**
 * Locale configuration shared by server and client.
 *
 * Deliberately free of `server-only` and of any heavy imports: middleware (proxy),
 * server components, client components and the payment providers all need these.
 */

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales written right-to-left. Drives `dir` on <html> and the RTL style variants. */
const RTL_LOCALES: readonly Locale[] = ["ar"];

/** Narrows an untrusted string (a route param, cookie or header) to a supported locale. */
export function hasLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Falls back to the default rather than throwing, for non-critical paths. */
export function toLocale(value: string | undefined | null): Locale {
  return hasLocale(value) ? value : DEFAULT_LOCALE;
}

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return isRtl(locale) ? "rtl" : "ltr";
}

/** Cookie remembering the visitor's choice, so the switcher survives a return visit. */
export const LOCALE_COOKIE = "boss_locale";
