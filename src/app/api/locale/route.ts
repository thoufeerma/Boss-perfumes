import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, hasLocale } from "@/lib/i18n/config";

/** Records the visitor's language choice. The switcher posts here, then refreshes. */
export async function POST(request: NextRequest) {
  let locale: unknown;
  try {
    ({ locale } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof locale !== "string" || !hasLocale(locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    // Readable by nothing but the server; the client already knows its own choice.
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ locale });
}
