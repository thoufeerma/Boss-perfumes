"use client";

import { useState } from "react";
import { Search, Package, AlertCircle, RotateCcw, CheckCircle, ArrowRight, ShieldCheck, Clock, Truck } from "lucide-react";
import { ReturnRequestModal } from "@/components/account/ReturnRequestModal";
import { useLocale } from "@/components/i18n/I18nProvider";

export default function ReturnsPortalPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setOrderData(null);

    const cleanId = orderId.replace(/\D/g, "");
    if (!cleanId || !email.trim()) {
      setError(isAr ? "يرجى إدخال رقم الطلب والبريد الإلكتروني." : "Please provide both Order Number and Billing Email.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/orders/return-request?orderId=${cleanId}&email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order not found");
      }

      setOrderData(data.order);
    } catch (err: any) {
      setError(err.message || (isAr ? "تعذر العثور على الطلب. يرجى التأكد من البيانات." : "Could not find order. Please verify your details."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-3xl">
        {/* Title & Introduction */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-4">
            {isAr ? "بوابة طلبات الإرجاع والاسترداد" : "Returns & Refunds Portal"}
          </h1>
          <p className="text-sm text-brand-text-muted max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "يمكنك تقديم ومتابعة طلبات الإرجاع لطلباتك بسهولة. نوفر خدمة الاستلام من باب المنزل أو التسليم في متجرنا بدبي."
              : "Easily submit and track returns for your orders. Enjoy doorstep courier pickup across the UAE or boutique drop-off in Dubai."}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-center text-xs">
          <div className="p-4 bg-brand-surface border border-brand-border">
            <Clock className="w-5 h-5 mx-auto mb-2 text-brand-text" />
            <p className="font-medium text-brand-text mb-0.5">{isAr ? "مهلة 14 يوماً" : "14-Day Return Window"}</p>
            <p className="text-brand-text-muted">{isAr ? "للمنتجات غير المفتوحة" : "For sealed, unopened bottles"}</p>
          </div>
          <div className="p-4 bg-brand-surface border border-brand-border">
            <Truck className="w-5 h-5 mx-auto mb-2 text-brand-text" />
            <p className="font-medium text-brand-text mb-0.5">{isAr ? "استلام من باب المنزل" : "Doorstep Courier Pickup"}</p>
            <p className="text-brand-text-muted">{isAr ? "في جميع أنحاء الإمارات" : "Available across all Emirates"}</p>
          </div>
          <div className="p-4 bg-brand-surface border border-brand-border">
            <ShieldCheck className="w-5 h-5 mx-auto mb-2 text-brand-text" />
            <p className="font-medium text-brand-text mb-0.5">{isAr ? "استرداد آمن وسريع" : "Automated Refunds"}</p>
            <p className="text-brand-text-muted">{isAr ? "تسوية فورية لتابي والبطاقات" : "Instant Tabby & Card reversal"}</p>
          </div>
        </div>

        {/* Lookup Card */}
        <div className="bg-brand-surface border border-brand-border p-8 md:p-10 shadow-sm">
          <h2 className="text-xl font-serif text-brand-text mb-6">
            {isAr ? "ابحث عن طلبك لتقديم طلب الإرجاع" : "Find Your Order to Begin Return"}
          </h2>

          <form onSubmit={handleLookup} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-text-muted mb-2 font-medium">
                  {isAr ? "رقم الطلب (مثال: 172)" : "Order Number (e.g. 172)"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? "أدخل رقم الطلب" : "e.g. 172"}
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-brand-bg-secondary border border-brand-border p-3.5 text-sm focus:outline-none focus:border-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-text-muted mb-2 font-medium">
                  {isAr ? "البريد الإلكتروني للطلب" : "Billing Email Address"}
                </label>
                <input
                  type="email"
                  required
                  placeholder={isAr ? "example@domain.com" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-bg-secondary border border-brand-border p-3.5 text-sm focus:outline-none focus:border-brand-text"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-text text-white py-4 text-xs uppercase tracking-widest hover:bg-black transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? (isAr ? "جاري البحث..." : "Locating Order...") : (isAr ? "البحث عن الطلب" : "Find Order")}</span>
            </button>
          </form>

          {/* Order Details Result */}
          {orderData && (
            <div className="mt-8 pt-8 border-t border-brand-border space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-brand-border">
                <div>
                  <h3 className="text-lg font-serif text-brand-text">
                    {isAr ? `طلب #${orderData.id}` : `Order #${orderData.id}`}
                  </h3>
                  <p className="text-xs text-brand-text-muted mt-0.5">
                    {isAr ? "تاريخ الطلب:" : "Placed on:"} {new Date(orderData.date_created).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest px-3 py-1 bg-brand-bg-secondary border border-brand-border font-medium">
                    {orderData.status}
                  </span>
                  <span className="text-sm font-semibold text-brand-text">
                    {parseFloat(orderData.total).toFixed(2)} AED
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-text-muted mb-3 font-medium">
                  {isAr ? "المنتجات داخل هذا الطلب:" : "Items in this Order:"}
                </p>
                <div className="space-y-2">
                  {orderData.line_items.map((item: any) => (
                    <div key={item.id} className="p-3 bg-brand-bg-secondary border border-brand-border flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-brand-text">{item.name}</p>
                        <p className="text-brand-text-muted">{isAr ? "الكمية:" : "Quantity:"} {item.quantity}</p>
                      </div>
                      <p className="font-medium text-brand-text">
                        {parseFloat(item.total).toFixed(2)} AED
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing Return Request or Action Button */}
              {orderData.existingReturn ? (
                <div className="p-5 bg-brand-bg-secondary border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-brand-text">
                      {isAr ? "طلب إرجاع مسجل مسبقاً" : "Existing Return Request Found"}
                    </span>
                    <span className="text-xs uppercase font-mono px-2.5 py-0.5 bg-brand-surface border border-brand-border">
                      {orderData.existingReturn.id}
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted">
                    {isAr
                      ? "طلبكم قيد المعالجة حالياً. سيقوم مندوب التوصيل بالتواصل معكم للاستلام وفحص المنتجات."
                      : "Your return is currently being processed. Our logistics team will contact you for parcel pickup."}
                  </p>
                </div>
              ) : orderData.status === "refunded" ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{isAr ? "تم استرداد هذا الطلب مسبقاً بالكامل." : "This order has already been fully refunded."}</span>
                </div>
              ) : orderData.status === "cancelled" ? (
                <div className="p-4 bg-gray-50 border border-gray-200 text-gray-700 text-sm">
                  {isAr ? "هذا الطلب ملغي." : "This order has been cancelled."}
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-[#111111] text-white py-4 text-xs uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{isAr ? "تقديم طلب إرجاع لهذا الطلب" : "Start Return Application for this Order"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {orderData && (
          <ReturnRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            order={orderData}
            onSuccess={(rmaId) => {
              setOrderData((prev: any) => ({
                ...prev,
                existingReturn: { id: rmaId, status: "pending_review" },
                returnStatus: "pending_review",
              }));
            }}
          />
        )}
      </div>
    </div>
  );
}
