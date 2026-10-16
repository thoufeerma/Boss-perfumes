import { MerchantInformation } from "@/components/common/MerchantInformation";
import { ContactForm } from "@/components/contact/ContactForm";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "ar") {
    return {
      title: "اتصل بنا | Boss Perfumes",
      description: "تواصل مع شركة بوس للتجارة العامة ذ.م.م للاستفسارات والدعم والملاحظات.",
    };
  }

  return {
    title: "Contact Us | Boss Perfumes",
    description: "Contact Boss General Trading LLC for inquiries, support, and feedback.",
  };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-6 text-center">
          {t.contact.title}
        </h1>
        <p className="text-center text-brand-text-muted mb-16 max-w-2xl mx-auto leading-relaxed">
          {t.contact.subtitle}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Merchant Information Column */}
          <div>
            <h2 className="text-xl font-serif text-brand-text mb-8">{t.contact.ourDetails}</h2>
            <div className="bg-brand-surface border border-brand-border p-8">
              <MerchantInformation />
            </div>
          </div>

          {/* Contact Form Column */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
