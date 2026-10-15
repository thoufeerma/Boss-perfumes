import "server-only";

import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, hasLocale, type Locale } from "./config";

/**
 * The locale for the current request.
 *
 * An explicit choice (the switcher's cookie) always wins. Failing that we honour the
 * browser's Accept-Language so an Arabic-speaking visitor lands on Arabic without
 * having to find the switch. Only two locales are supported, so this is a plain scan
 * rather than a full BCP-47 negotiation.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const chosen = cookieStore.get(LOCALE_COOKIE)?.value;
  if (hasLocale(chosen)) return chosen;

  const accept = (await headers()).get("accept-language") ?? "";
  for (const entry of accept.split(",")) {
    const tag = entry.split(";")[0]?.trim().toLowerCase();
    const base = tag?.split("-")[0];
    if (hasLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}
