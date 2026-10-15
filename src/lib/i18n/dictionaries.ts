import en from "./dictionaries/en.json";
import ar from "./dictionaries/ar.json";
import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * UI copy, keyed by locale.
 *
 * Imported statically rather than dynamically: the whole app is server-rendered on demand
 * (see the build output - every route is `ƒ`), so there is no static payload to keep small,
 * and a synchronous dictionary is far simpler to hand to client components through context.
 *
 * `en` is the source of truth for the shape; `ar` is typed against it so a missing Arabic
 * key is a compile error rather than an English string leaking into the Arabic storefront.
 */
export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
