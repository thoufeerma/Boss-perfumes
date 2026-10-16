import { getLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "ar") {
    return {
      title: "سياسة الشحن والتوصيل | Boss Perfumes",
      description: "سياسة الشحن ومواعيد التوصيل لعطور Boss Perfumes في الإمارات وخارجها.",
    };
  }
  return {
    title: "Shipping Policy | Boss Perfumes",
    description: "Shipping policy and delivery information for Boss Perfumes.",
  };
}

export default async function ShippingPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  if (isAr) {
    return (
      <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">
            سياسة الشحن والتوصيل
          </h1>

          <div className="prose prose-brand max-w-none text-brand-text-muted leading-relaxed">
            <p className="mb-6">
              في <strong>شركة بوس للتجارة العامة ذ.م.م (Boss General Trading LLC)</strong>، نلتزم بتوصيل عطوركم الفاخرة المفضلة بكل سرعة وأمان واحترافية. يُرجى قراءة سياسة الشحن والتوصيل أدناه للتعرف على إجراءات التوصيل ومواعيده والرسوم المطبقة.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. مدة تجهيز الطلبات</h2>
            <p className="mb-6">
              تتم معالجة وتجهيز جميع الطلبات خلال يوم إلى يومي عمل (باستثناء أيام الأحد والعطلات الرسمية) فور استلامكم لرسالة تأكيد الطلب عبر البريد الإلكتروني. وستتلقون إشعاراً جديداً يتضمن رقم التتبع بمجرد خروج شحنتكم للشحن.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. التوصيل داخل دولة الإمارات العربية المتحدة</h2>
            <p className="mb-6">
              نوفر خدمة شحن سريعة وموثوقة إلى جميع مناطق وإمارات دولة الإمارات العربية المتحدة:
            </p>
            <ul className="list-disc ps-6 mt-2 mb-6 space-y-1">
              <li><strong>التوصيل القياسي:</strong> يستغرق من 2 إلى 3 أيام عمل.</li>
              <li><strong>التوصيل السريع:</strong> متاح في مناطق محددة (دبي والشارقة) للتسليم في اليوم التالي في حال تأكيد الطلب قبل موعد الإغلاق اليومي.</li>
            </ul>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. الشحن الدولي</h2>
            <p className="mb-6">
              نوفر خدمة الشحن الدولي إلى دول محددة. يتم حساب رسوم الشحن الخاصة بطلبكم بدقة وعرضها في صفحة الدفع قبل تأكيد الطلب. وتتراوح أوقات التوصيل الدولي عادةً بين 5 إلى 14 يوم عمل تبعاً للوجهة المقصودة.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. الرسوم الجمركية والضرائب</h2>
            <p className="mb-6">
              بالنسبة للشحنات الدولية، لا تتحمل <strong>شركة بوس للتجارة العامة ذ.م.م</strong> أي مسؤولية عن أية رسوم جمركية أو ضرائب استيراد قد تُفرض في بلد المقصد. كافة الرسوم المفروضة أثناء الشحن أو بعده تقع على عاتق العميل بالكامل (مثل التعريفات الجمركية والضرائب وغيرها).
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. تتبع حالة الشحنة</h2>
            <p className="mb-6">
              فور شحن طلبكم، ستتلقون رسالة بريد إلكتروني تحتوي على رقم التتبع الخاص بالشحنة لمتابعة مسارها مباشرة. يُرجى الانتظار حتى 24 ساعة لتفعيل بيانات التتبع على نظام شركة الشحن.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. حالات التأخير غير المتوقعة</h2>
            <p className="mb-6">
              رغم بذلنا كل جهد ممكن لضمان التوصيل في المواعيد المحددة، قد تطرأ أحياناً حالات تأخير استثنائية ناتجة عن ظروف خارجة عن سيطرتنا، مثل الأحوال الجوية، أو تأخيرات لدى شركات النقل، أو إجراءات الفحص الجمركي. وسنبذل قصارى جهدنا لإبقائكم على علم في حال توقع أي تأخير ملحوظ في تسليم طلبكم.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. معلومات الاتصال والاستفسار</h2>
            <p className="mb-6">
              إذا كان لديكم أي سؤال بخصوص شحن وتوصيل طلبكم، يُرجى مراسلتنا عبر: <a href="mailto:brbossperfumes@gmail.com" className="text-brand-text underline hover:text-brand-accent">brbossperfumes@gmail.com</a>.
            </p>

            <div className="mt-12 pt-8 border-t border-brand-border text-sm text-center">
              <p>آخر تحديث: يوليو 2026</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">Shipping Policy</h1>
        
        <div className="prose prose-brand max-w-none text-brand-text-muted">
          <p className="mb-6">
            At <strong>Boss General Trading LLC</strong>, we are committed to delivering your favorite luxury perfumes promptly and securely. 
            Please read our shipping policy below to understand our delivery processes, times, and costs.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. Order Processing Time</h2>
          <p className="mb-6">
            All orders are processed within 1 to 2 business days (excluding Sundays and public holidays) after receiving your order confirmation email. 
            You will receive another notification when your order has shipped.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. UAE Shipping</h2>
          <p className="mb-6">
            We offer fast and reliable shipping across the United Arab Emirates.
          </p>
          <ul className="list-disc ps-6 mt-2 mb-6">
            <li><strong>Standard Delivery:</strong> 2-3 business days.</li>
            <li><strong>Express Delivery:</strong> Available in select areas (Dubai, Sharjah) for next-day delivery if ordered before our daily cutoff time.</li>
          </ul>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. International Shipping</h2>
          <p className="mb-6">
            We currently offer international shipping to select countries. Shipping charges for your order will be calculated and displayed at checkout. 
            Delivery times vary depending on the destination, generally ranging from 5 to 14 business days.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. Customs, Duties, and Taxes</h2>
          <p className="mb-6">
            For international orders, <strong>Boss General Trading LLC</strong> is not responsible for any customs and taxes applied to your order. 
            All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. Order Tracking</h2>
          <p className="mb-6">
            Once your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. 
            Please allow up to 24 hours for the tracking information to become available.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. Delivery Delays</h2>
          <p className="mb-6">
            While we strive to ensure timely delivery, there may be occasional delays due to unforeseen circumstances, such as severe weather, carrier delays, or customs holds. 
            We will do our best to keep you informed if we anticipate a significant delay with your order.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. Contact Information</h2>
          <p className="mb-6">
            If you have any questions about the delivery of your order, please contact us at <a href="mailto:brbossperfumes@gmail.com" className="text-brand-text underline hover:text-brand-accent">brbossperfumes@gmail.com</a>.
          </p>
          
          <div className="mt-12 pt-8 border-t border-brand-border text-sm text-center">
            <p>Last Updated: July 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
