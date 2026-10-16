import { getLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "ar") {
    return {
      title: "سياسة الخصوصية | Boss Perfumes",
      description: "سياسة الخصوصية لمتجر Boss Perfumes وتفاصيل جمع البيانات وحمايتها.",
    };
  }
  return {
    title: "Privacy Policy | Boss Perfumes",
    description: "Privacy policy for Boss Perfumes, detailing data collection and usage.",
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  if (isAr) {
    return (
      <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">
            سياسة الخصوصية
          </h1>

          <div className="prose prose-brand max-w-none text-brand-text-muted leading-relaxed">
            <p className="mb-6">
              في <strong>شركة بوس للتجارة العامة ذ.م.م (Boss General Trading LLC)</strong>، نلتزم التزاماً كاملاً بحماية خصوصيتكم وضمان سرية وأمان معلوماتكم الشخصية. توضح سياسة الخصوصية هذه كيفية جمع بياناتكم واستخدامها وحمايتها عند زيارتكم لموقعنا أو إتمام عملية شراء.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. المعلومات التي نجمعها</h2>
            <p className="mb-6">
              عند زيارة موقعنا، أو إنشاء حساب شخصي، أو إجراء عملية شراء، قد نجمع بيانات شخصية تشمل اسمكم، وعنوان البريد الإلكتروني، وعنوان الشحن وعنوان الفاتورة، ورقم الهاتف المحمول، وتفاصيل وسيلة الدفع. كما نقوم تلقائياً بجمع بيانات تقنية محددة حول جهازكم، مثل عنوان بروتوكول الإنترنت (IP)، ونوع المتصفح المستخدم، ونظام التشغيل، والمنطقة الزمنية.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. استخدام المعلومات</h2>
            <p className="mb-6">
              نستخدم المعلومات المجمعة لمعالجة طلباتكم وتنفيذها، والتواصل معكم بخصوص مشترياتكم وحالة الشحن، وتقديم خدمات دعم العملاء، وتطوير أداء الموقع وتحسين تجربة التسوق. وبموافقتكم، قد نرسل إليكم رسائل بريد إلكتروني ترويجية لإحاطتكم بأحدث العطور والعروض الخاصة.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. ملفات تعريف الارتباط (الكوكيز) والتحليلات</h2>
            <p className="mb-6">
              يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة التصفح، وحفظ تفضيلاتكم اللغوية، والاحتفاظ بالمنتجات المضافة في حقيبة التسوق الخاصة بكم. كما نستخدم أدوات التحليل لفهم كيفية تفاعل الزوار مع الموقع، مما يساعدنا على تحسين جودة المحتوى والخدمات المقدمة.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. أمان الدفع ومزودو الخدمات من الأطراف الثالثة</h2>
            <p className="mb-6">
              نضع أمان معاملاتكم المالية على رأس أولوياتنا. تتم معالجة جميع المدفوعات بشكل مشفر وآمن عبر مزودي خدمات الدفع المعتمدين والموثوقين لدينا (Checkout.com و Telr و Tabby). كما نعتمد بروتوكولات مصادقة وتشفير متقدمة JWT لتأمين الحسابات. لا نقوم بتخزين تفاصيل بطاقاتك الائتمانية الكاملة على خوادمنا نهائياً؛ بل يتم تشفيرها وإرسالها مباشرة إلى بوابات الدفع.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. بيانات العملاء عبر ووكومرس (WooCommerce)</h2>
            <p className="mb-6">
              يتكامل متجرنا مع ووكومرس لإدارة الطلبات وحسابات العملاء بأعلى معايير الأمان المتبعة. تُخزن بياناتكم الشخصية في قواعد بيانات مؤمنة ومحمية، ولا يُتاح الوصول إليها إلا للموظفين المخولين حصراً لأغراض معالجة الطلبات وخدمة العملاء.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. حقوقكم القانونية</h2>
            <p className="mb-6">
              يحق لكم في أي وقت طلب الوصول إلى معلوماتكم الشخصية، أو تحديثها وتصحيحها، أو طلب حذفها من سجلاتنا. إذا كنتم ترغبون في ممارسة هذه الحقوق أو لديكم أي استفسار أو مخاوف بشأن خصوصية بياناتكم، يُرجى التواصل معنا مباشرة.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. معلومات الاتصال</h2>
            <p className="mb-6">
              لأية استفسارات تتعلق بسياسة الخصوصية وحماية البيانات، يسعدنا تواصلكم معنا عبر:<br />
              <strong>شركة بوس للتجارة العامة ذ.م.م</strong><br />
              البريد الإلكتروني: <a href="mailto:brbossperfumes@gmail.com" className="text-brand-text underline hover:text-brand-accent">brbossperfumes@gmail.com</a><br />
              الهاتف: +971 4 235 6130 / +971 4 3983968
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
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">Privacy Policy</h1>
        
        <div className="prose prose-brand max-w-none text-brand-text-muted">
          <p className="mb-6">
            At <strong>Boss General Trading LLC</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website or make a purchase.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-6">
            When you visit our site, register an account, or make a purchase, we may collect personal information including your name, email address, shipping and billing address, phone number, and payment details. 
            We also automatically collect certain information about your device, such as your IP address, browser type, and time zone.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. Use of Information</h2>
          <p className="mb-6">
            We use the collected information to process and fulfill your orders, communicate with you regarding your purchase, provide customer support, and improve our website's functionality and user experience. 
            With your consent, we may also send you promotional emails about new products or offers.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. Cookies & Analytics</h2>
          <p className="mb-6">
            Our website uses cookies to enhance your browsing experience, remember your preferences, and track the items in your shopping cart. 
            We also use analytics tools to understand how our customers interact with the site, allowing us to optimize our content and marketing efforts.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. Payment Security & Third-Party Providers</h2>
          <p className="mb-6">
            We prioritize the security of your transactions. All payments are processed securely through our trusted third-party payment providers (Checkout.com, Telr). 
            We utilize secure JWT authentication for account access. We do not store your complete credit card information on our servers; it is encrypted and transmitted directly to the payment gateways.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. WooCommerce Customer Data</h2>
          <p className="mb-6">
            Our store is integrated with WooCommerce, which assists in managing orders and customer data securely. 
            Your personal information is stored securely in our database and is only accessed by authorized personnel for order processing and customer service purposes.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. Your Rights</h2>
          <p className="mb-6">
            You have the right to access, update, or request the deletion of your personal information. If you wish to exercise these rights or have any concerns about your data, please contact us.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. Contact Information</h2>
          <p className="mb-6">
            For any privacy-related inquiries, you can reach us at:<br/>
            <strong>Boss General Trading LLC</strong><br/>
            Email: <a href="mailto:brbossperfumes@gmail.com" className="text-brand-text underline hover:text-brand-accent">brbossperfumes@gmail.com</a><br/>
            Phone: +971 4 235 6130 / +971 4 3983968
          </p>
          
          <div className="mt-12 pt-8 border-t border-brand-border text-sm text-center">
            <p>Last Updated: July 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
