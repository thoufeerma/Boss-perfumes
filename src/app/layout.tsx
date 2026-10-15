import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Neither Inter nor Cormorant Garamond ships Arabic glyphs, so Arabic text would fall back
// to whatever the device happens to have. This keeps the Arabic storefront on brand.
const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { SearchDrawer } from "@/components/navigation/SearchDrawer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/api/cart";
import { getLocale } from "@/lib/i18n/server";
import { dirFor } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/components/i18n/I18nProvider";

import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "Boss Perfumes | Luxury Fragrances",
  description: "Discover the luxury collection of Boss Perfumes. Premium, editorial, and timeless.",
  icons: {
    icon: "/fav icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tokenPayload = await getCurrentUser();
  const isAuthenticated = !!tokenPayload;
  const initialCart = await getCart();
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${inter.variable} ${cormorant.variable} ${notoKufiArabic.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col selection:bg-brand-accent selection:text-white">
        <I18nProvider locale={locale} dictionary={getDictionary(locale)}>
          <AuthProvider isAuthenticated={isAuthenticated}>
            <CartProvider initialCart={initialCart}>
              <Header locale={locale} />
              <MobileMenu />
              <SearchDrawer />
              <CartDrawer />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
        <Toaster position="bottom-right" toastOptions={{
          style: { background: '#111111', color: '#fff', border: 'none', borderRadius: '8px' }
        }} />
      </body>
    </html>
  );
}
