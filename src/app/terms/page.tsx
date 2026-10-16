import { getLocale } from "@/lib/i18n/server";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "ar") {
    return {
      title: "الشروط والأحكام | Boss Perfumes",
      description: "الشروط والأحكام لموقع Boss Perfumes، شركة بوس للتجارة العامة ذ.م.م.",
    };
  }
  return {
    title: "Terms & Conditions | Boss Perfumes",
    description: "Terms and conditions for Boss Perfumes, Boss General Trading LLC.",
  };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  if (isAr) {
    return (
      <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">
            الشروط والأحكام
          </h1>

          <div className="prose prose-brand max-w-none text-brand-text-muted leading-relaxed">
            <p className="mb-6 text-brand-text font-medium">مرحباً بكم في Boss Perfumes.</p>

            <p className="mb-6">
              تحكم هذه الشروط والأحكام ("الشروط") استخدامكم لموقع Boss Perfumes وشرائكم للمنتجات المعروضة من خلاله. من خلال تصفح أو استخدام موقعنا الإلكتروني، فإنكم توافقون على الالتزام التام بهذه الشروط. الكيان القانوني المتعاقد لجميع عمليات الشراء هو <strong>شركة بوس للتجارة العامة ذ.م.م (Boss General Trading LLC)</strong>.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. الطرف المتعاقد والاختصاص القضائي</h2>
            <p className="mb-6">
              عند قيامكم بالشراء من موقعنا، فإن عقدكم القانوني يكون مبرماً مع <strong>شركة بوس للتجارة العامة ذ.م.م</strong>، وهي شركة مسجلة وقائمة في <strong>دولة الإمارات العربية المتحدة</strong>. تخضع هذه الشروط وتُفسر وفقاً للقوانين واللوائح السارية في دولة الإمارات العربية المتحدة. وتخضع أي نزاعات قد تنشأ عن هذه الشروط أو ترتبط بها للاختصاص القضائي الحصري لمحاكم دبي في دولة الإمارات العربية المتحدة.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. التزامات العميل</h2>
            <p className="mb-6">
              من خلال تقديم أي طلب شراء، فإنكم تقرون وتؤكدون تمتعكم بالأهلية القانونية الكاملة لإبرام العقود والالتزامات الملزمة، وأن جميع المعلومات والبيانات التي تقدمونها صحيحة ودقيقة وكاملة. كما تتعهدون بعدم استخدام منتجاتنا لأي غرض غير قانوني أو غير مصرح به بموجب القوانين المعمول بها.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. التزامات المتجر</h2>
            <p className="mb-6">
              نحرص باستمرار وبأقصى درجات العناية على تقديم معلومات دقيقة حول أوصاف العطور والمنتجات وأسعارها وتوفرها في المخزون. ومع ذلك، فإننا لا نضمن خلو جميع أوصاف المنتجات أو المحتويات من الأخطاء غير المقصودة أو اكتمالها بصورة مطلقة في كافة الأوقات. ونحتفظ بكامل الحق في تعديل أي منتج أو إيقاف توفيره في أي وقت دون إشعار مسبق.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. آلية الطلب والتسعير</h2>
            <p className="mb-6">
              جميع الأسعار المعروضة على هذا الموقع هي بـ <strong>الدرهم الإماراتي (AED)</strong>. ونحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب مشروع، بما في ذلك القيود المفروضة على الكميات المتاحة للشراء، أو عدم الدقة في مواصفات المنتج أو التسعير، أو أي مخاطر يتم رصدها من خلال أنظمة مكافحة الاحتيال لدينا.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. وسائل الدفع والأمان</h2>
            <p className="mb-6">
              نقبل الدفع ببطاقات فيزا وماستركارد بالإضافة إلى وسائل الدفع المعتمدة الأخرى (مثل تابي للمدفوعات الميسرة). وتتم معالجة جميع المعاملات المالية بأعلى معايير التشفير والأمان عبر بوابات دفع معتمدة وموثوقة (Checkout.com و Telr). نحن لا نقوم بتخزين تفاصيل بطاقاتك الائتمانية الكاملة على خوادمنا نهائياً.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. الشحن والاسترجاع واسترداد الأموال</h2>
            <p className="mb-6">
              يُرجى مراجعة <Link href="/shipping" className="text-brand-text underline hover:text-brand-accent">سياسة الشحن</Link> و <Link href="/refund" className="text-brand-text underline hover:text-brand-accent">سياسة الاسترجاع</Link> للحصول على تفاصيل شاملة حول فترات التوصيل والتكاليف وإجراءات الإرجاع وإلغاء الطلبات.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. حقوق الملكية الفكرية</h2>
            <p className="mb-6">
              جميع محتويات هذا الموقع الإلكتروني، بما في ذلك النصوص، والتصاميم، والشعارات، والصور، والمواد الصوتية والمرئية، والبرمجيات، هي ملكية حصرية لشركة بوس للتجارة العامة ذ.م.م، ومحمية بموجب القوانين والاتفاقيات الدولية المنظمة لحقوق الملكية الفكرية والعلامات التجارية.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">8. حدود المسؤولية</h2>
            <p className="mb-6">
              لا تتحمل شركة بوس للتجارة العامة ذ.م.م المسؤولية عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو خاصة أو تبعية قد تنتج عن استخدام أو عدم القدرة على استخدام موقعنا أو منتجاتنا المعروضة.
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
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">Terms & Conditions</h1>
        
        <div className="prose prose-brand max-w-none text-brand-text-muted">
          <p className="mb-6 text-brand-text font-medium">Welcome to Boss Perfumes.</p>
          
          <p className="mb-6">
            These Terms & Conditions ("Terms") govern your use of the Boss Perfumes website and your purchase of products from us. 
            By accessing or using our website, you agree to be bound by these Terms. 
            The contracting entity for all purchases is <strong>Boss General Trading LLC</strong>.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. Contracting Party & Jurisdiction</h2>
          <p className="mb-6">
            When you purchase from our website, your contract is with <strong>Boss General Trading LLC</strong>, a company registered in the <strong>United Arab Emirates</strong>. 
            These Terms are governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Dubai, United Arab Emirates.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. Customer Obligations</h2>
          <p className="mb-6">
            By placing an order, you confirm that you are legally capable of entering into binding contracts and that all information you provide is accurate and complete. 
            You agree not to use our products for any illegal or unauthorized purpose.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. Merchant Obligations</h2>
          <p className="mb-6">
            We strive to provide accurate product descriptions, pricing, and availability information. However, we do not warrant that product descriptions or other content are error-free, complete, or current. 
            We reserve the right to modify or discontinue any product at any time without notice.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. Ordering Process & Pricing</h2>
          <p className="mb-6">
            All prices displayed on this website are in <strong>United Arab Emirates Dirham (AED)</strong>. 
            We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies in product or pricing information, or problems identified by our fraud avoidance department.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. Payment</h2>
          <p className="mb-6">
            We accept Visa and Mastercard payments. All payments are processed securely. Your payment information is encrypted and transmitted securely to our payment processors (Checkout.com, Telr). 
            We do not store your full credit card details on our servers.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. Shipping, Returns & Refunds</h2>
          <p className="mb-6">
            Please refer to our <Link href="/shipping" className="text-brand-text underline hover:text-brand-accent">Shipping Policy</Link> and <Link href="/refund" className="text-brand-text underline hover:text-brand-accent">Refund Policy</Link> for detailed information on delivery times, costs, and our procedures for returns and cancellations.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. Intellectual Property</h2>
          <p className="mb-6">
            All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Boss General Trading LLC and is protected by international copyright laws.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="mb-6">
            Boss General Trading LLC shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our website or products.
          </p>
          
          <div className="mt-12 pt-8 border-t border-brand-border text-sm text-center">
            <p>Last Updated: July 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
