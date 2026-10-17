"use client";

import { useState } from "react";
import { RotateCcw, Clock, CheckCircle, Package } from "lucide-react";
import { ReturnRequestModal } from "./ReturnRequestModal";
import { useLocale } from "@/components/i18n/I18nProvider";

interface OrderReturnSectionProps {
  order: any;
}

export function OrderReturnSection({ order }: OrderReturnSectionProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check existing return request in metadata
  const initialReturn = order.meta_data?.find((m: any) => m.key === "_return_request")?.value || null;
  const initialStatus = order.meta_data?.find((m: any) => m.key === "_return_request_status")?.value || null;
  
  const [returnReq, setReturnReq] = useState<any>(initialReturn);
  const [status, setStatus] = useState<string | null>(initialStatus);

  const isRefunded = order.status === "refunded";
  const isCancelled = order.status === "cancelled";

  // Check 14-day policy window
  const orderDate = new Date(order.date_created);
  const daysSince = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
  const isWithin14Days = daysSince <= 14;

  if (isRefunded) {
    return (
      <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-3 text-emerald-800">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-medium text-sm">
              {isAr ? "تم استرداد هذا الطلب بنجاح" : "This order has been fully refunded"}
            </p>
            <p className="text-xs text-emerald-700/80 mt-0.5">
              {isAr ? "تمت معالجة الاسترداد المالي إلى وسيلة الدفع الخاصة بكم." : "The refund has been credited back to your payment method."}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold uppercase tracking-wider px-3 py-1 bg-emerald-100 text-emerald-800 rounded">
          {isAr ? "مسترد" : "Refunded"}
        </span>
      </div>
    );
  }

  if (returnReq) {
    return (
      <div className="mt-8 p-6 bg-brand-bg-secondary border border-brand-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand-text shrink-0" />
            <div>
              <p className="font-serif text-base text-brand-text">
                {isAr ? "طلب الإرجاع قيد المراجعة" : "Return Request in Progress"}
              </p>
              <p className="text-xs font-mono text-brand-text-muted mt-0.5">
                RMA: {returnReq.id || `RMA-${order.id}`}
              </p>
            </div>
          </div>
          <span className="inline-block px-3 py-1 bg-brand-surface border border-brand-border text-brand-text text-xs uppercase tracking-widest font-medium">
            {status === "approved" ? (isAr ? "تمت الموافقة" : "Approved") : (isAr ? "قيد المراجعة" : "Pending Review")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-brand-text-muted">
          <div>
            <span className="uppercase tracking-wider font-medium text-brand-text block mb-1">
              {isAr ? "طريقة الإرجاع:" : "Collection Method:"}
            </span>
            <p>{returnReq.returnMethod === "courier_pickup" ? (isAr ? "مندوب استلام منزلي" : "Doorstep Courier Pickup") : (isAr ? "تسليم بالمتجر" : "Store Drop-off")}</p>
          </div>
          <div>
            <span className="uppercase tracking-wider font-medium text-brand-text block mb-1">
              {isAr ? "حالة المعالجة:" : "Status Details:"}
            </span>
            <p>{isAr ? "سيقوم فريق الجودة بفحص السلعة فور استلامها وإتمام استرداد الأموال." : "Our quality team will inspect the item upon receipt and release the refund."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-brand-bg-secondary border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h4 className="text-base font-serif text-brand-text mb-1">
          {isAr ? "هل تحتاج إلى إرجاع هذا الطلب؟" : "Need to Return or Refund This Order?"}
        </h4>
        <p className="text-xs text-brand-text-muted">
          {isWithin14Days
            ? (isAr ? "يمكنك تقديم طلب إرجاع المنتجات غير المفتوحة خلال 14 يوماً من استلام الطلب." : "You can request a return for unopened sealed items within 14 days of delivery.")
            : (isAr ? "انتهت فترة الـ 14 يوماً المسموح بها للإرجاع بحسب سياسة المتجر." : "The 14-day policy window for standard returns has elapsed.")}
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="shrink-0 inline-flex items-center gap-2 bg-[#111111] text-white py-3 px-6 text-xs uppercase tracking-widest hover:bg-black transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{isAr ? "طلب إرجاع / استرداد" : "Request Return / Refund"}</span>
      </button>

      <ReturnRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={order}
        onSuccess={(rmaId) => {
          setReturnReq({ id: rmaId, returnMethod: "courier_pickup" });
          setStatus("pending_review");
        }}
      />
    </div>
  );
}
