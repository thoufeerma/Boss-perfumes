import { getLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "ar") {
    return {
      title: "سياسة الاسترجاع والاسترداد | Boss Perfumes",
      description: "سياسة الاسترجاع والاسترداد لمنتجات العطور في Boss Perfumes.",
    };
  }
  return {
    title: "Refund & Return Policy | Boss Perfumes",
    description: "Refund and return policy for Boss Perfumes.",
  };
}

export default async function RefundPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  if (isAr) {
    return (
      <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">
            سياسة الاسترجاع والاسترداد
          </h1>

          <div className="prose prose-brand max-w-none text-brand-text-muted leading-relaxed">
            <p className="mb-6">
              في <strong>شركة بوس للتجارة العامة ذ.م.م (Boss General Trading LLC)</strong>، نحرص كل الحرص على أن تكونوا راضين تماماً عن كل عطر تشترونه منا. إذا لم تكن راضياً عن طلبك لأي سبب، فنحن هنا لمساعدتك. يُرجى مراجعة سياستنا المعتمدة لعمليات الاسترجاع واسترداد الأموال الخاصة بمنتجات العطور.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. شروط الأهلية للاسترجاع</h2>
            <p className="mb-6">
              نظراً لطبيعة منتجات العطور ومستحضرات التجميل، فإننا نقبل فقط استرجاع المنتجات التي تكون غير مستخدمة، وغير مفتوحة، وبحالتها الأصلية السليمة داخل غلافها الأصلي مع بقاء جميع الأختام وشريط الحماية سليماً تماماً. لا يمكن إرجاع العطور المفتوحة أو المستخدمة لأسباب تتعلق بالصحة والسلامة العامة.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. المدة المحددة لتقديم الطلب</h2>
            <p className="mb-6">
              يحق لكم تقديم طلب استرجاع أو استبدال خلال <strong>14 يوماً</strong> من تاريخ استلام الطلب. ولن نتمكن من قبول أي طلبات يتم تقديمها بعد انقضاء هذه المدة (14 يوماً).
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. المنتجات التالفة أو غير المطابقة</h2>
            <p className="mb-6">
              إذا استلمتم منتجاً تالفاً أو غير مطابق لطلبكم، يُرجى التواصل معنا فور استلام الشحنة مباشرة. سنقوم بترتيب استبدال فوري أو رد كامل المبلغ المدفوع شاملاً أي رسوم شحن ترتبت على ذلك. يُرجى تزويدنا بصور فوتوغرافية واضحة تثبت حالة التلف لمساعدتنا في سرعة معالجة طلبكم.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. المنتجات غير القابلة للإرجاع</h2>
            <p className="mb-6">
              المنتجات التالية غير قابلة للإرجاع أو الاستبدال نهائياً:
            </p>
            <ul className="list-disc ps-6 mt-2 mb-6 space-y-1">
              <li>العطور والمستحضرات المفتوحة أو المستخدمة كلياً أو جزئياً.</li>
              <li>المنتجات التي تم نزع أو إتلاف أختامها الأمنية أو غلاف السلوفان الأصلي.</li>
              <li>المنتجات المشتراة ضمن عروض التصفية النهائية الخاصة.</li>
            </ul>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. إجراءات معالجة استرداد الأموال</h2>
            <p className="mb-6">
              بمجرد استلامنا للمنتج المرتجع وفحصه من قبل فريق الجودة، سنقوم بإشعاركم بنتيجة فحص المنتج بالموافقة أو الرفض. وفي حال الموافقة، ستتم معالجة المبلغ المسترد تلقائياً وإعادته إلى وسيلة الدفع الأصلية ذاتها (فيزا أو ماستركارد) خلال عدد من أيام العمل بحسب السياسات المتبعة لدى البنك المصدر لبطاقتكم.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. تكاليف الشحن للإرجاع</h2>
            <p className="mb-6">
              يتحمل العميل تكلفة الشحن الخاصة بإرجاع المنتج إلينا، ما لم يكن سبب الإرجاع ناتجاً عن عيب في المنتج أو خطأ في التجهيز من طرفنا. رسوم الشحن الأصلية غير قابلة للاسترداد. وفي حال رد المبلغ، سيتم خصم تكلفة شحن الإرجاع من المبلغ الإجمالي المسترد.
            </p>

            <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. بيانات التواصل لطلبات الإرجاع</h2>
            <p className="mb-6">
              لبدء طلب استرجاع أو تقديم استفسار، يُرجى التواصل مع فريق خدمة العملاء:<br />
              البريد الإلكتروني: <a href="mailto:brbossperfumes@gmail.com" className="text-brand-text underline hover:text-brand-accent">brbossperfumes@gmail.com</a><br />
              الهاتف: +971 4 235 6130
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
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">Refund & Return Policy</h1>
        
        <div className="prose prose-brand max-w-none text-brand-text-muted">
          <p className="mb-6">
            At <strong>Boss General Trading LLC</strong>, we want you to be completely satisfied with your purchase. 
            If you are not entirely happy with your order, we're here to help. Please review our policy regarding returns and refunds for perfume products.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. Eligibility for Returns</h2>
          <p className="mb-6">
            Due to the nature of our products, we only accept returns for items that are unused, unopened, and in their original packaging with all seals intact. 
            Used or opened perfumes cannot be returned for hygiene and safety reasons.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. Time Limits</h2>
          <p className="mb-6">
            You have <strong>14 days</strong> from the date of delivery to request a return or exchange. 
            Requests made after this 14-day period will not be accepted.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. Damaged or Incorrect Products</h2>
          <p className="mb-6">
            If you receive a damaged product or an incorrect item, please contact us immediately upon receipt. 
            We will arrange for a replacement or a full refund, including any shipping charges incurred. Please provide photographic evidence of the damage to assist us in processing your claim.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. Non-Returnable Items</h2>
          <p className="mb-6">
            The following items are strictly non-returnable:
          </p>
          <ul className="list-disc ps-6 mt-2 mb-6">
            <li>Opened or used perfumes and fragrances.</li>
            <li>Products with tampered or broken seals.</li>
            <li>Items purchased on final sale or clearance.</li>
          </ul>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. Refund Processing</h2>
          <p className="mb-6">
            Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. 
            If approved, the refund will be processed and automatically applied to your original method of payment (Visa or Mastercard) within a certain number of days, depending on your card issuer's policies.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. Shipping Responsibility</h2>
          <p className="mb-6">
            You will be responsible for paying your own shipping costs for returning your item, unless the return is due to a defect or an error on our part. 
            Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. Contact Details for Returns</h2>
          <p className="mb-6">
            To initiate a return, please contact our customer service team:<br/>
            Email: <a href="mailto:brbossperfumes@gmail.com" className="text-brand-text underline hover:text-brand-accent">brbossperfumes@gmail.com</a><br/>
            Phone: +971 4 235 6130
          </p>
          
          <div className="mt-12 pt-8 border-t border-brand-border text-sm text-center">
            <p>Last Updated: July 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
