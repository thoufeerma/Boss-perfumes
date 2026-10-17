"use client";

import { useState } from "react";
import { X, CheckCircle2, Truck, Store, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useLocale } from "@/components/i18n/I18nProvider";

interface ReturnItem {
  id: number;
  name: string;
  quantity: number;
  price?: string | number;
  selectedQty: number;
  isSelected: boolean;
  reason: string;
}

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: number;
    billing?: any;
    shipping?: any;
    payment_method?: string;
    payment_method_title?: string;
    line_items: any[];
    currency_symbol?: string;
  };
  onSuccess?: (rmaId: string) => void;
}

const REASONS_EN = [
  "Damaged or leaking bottle during delivery",
  "Incorrect product or size received",
  "Changed mind (Unopened with original seal intact)",
  "Fragrance scent not as expected (Unopened & sealed)",
  "Other"
];

const REASONS_AR = [
  "المنتج تالف أو به تسريب أثناء التوصيل",
  "استلام منتج أو حجم غير مطابق للطلب",
  "تغيير الرأي (غير مفتوح وبغلاف السلوفان الأصلي)",
  "الرائحة غير مطابقة للتوقع (غير مفتوح ومغلق بإحكام)",
  "سبب آخر"
];

export function ReturnRequestModal({ isOpen, onClose, order, onSuccess }: ReturnRequestModalProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const reasons = isAr ? REASONS_AR : REASONS_EN;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [items, setItems] = useState<ReturnItem[]>(() =>
    order.line_items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      selectedQty: item.quantity,
      isSelected: false,
      reason: reasons[0],
    }))
  );

  const [overallReason, setOverallReason] = useState(reasons[0]);
  const [comments, setComments] = useState("");
  const [returnMethod, setReturnMethod] = useState<"courier_pickup" | "store_dropoff">("courier_pickup");

  const [pickupAddress, setPickupAddress] = useState({
    address: order.shipping?.address_1 || order.billing?.address_1 || "",
    city: order.shipping?.city || order.billing?.city || "Dubai",
    phone: order.billing?.phone || "",
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountHolder: `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim(),
    iban: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRma, setSubmittedRma] = useState<string | null>(null);

  if (!isOpen) return null;

  const isTabby = order.payment_method?.toLowerCase().includes("tabby");
  const isCOD = order.payment_method?.toLowerCase().includes("cod") || order.payment_method?.toLowerCase().includes("cash");

  const toggleItemSelect = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSelected: !item.isSelected } : item))
    );
  };

  const updateItemQty = (id: number, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selectedQty: Math.max(1, Math.min(item.quantity, qty)) } : item))
    );
  };

  const selectedItems = items.filter((it) => it.isSelected);

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (selectedItems.length === 0) {
        setError(isAr ? "يرجى تحديد منتج واحد على الأقل للإرجاع." : "Please select at least one item to return.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (returnMethod === "courier_pickup" && (!pickupAddress.address || !pickupAddress.phone)) {
        setError(isAr ? "يرجى إدخال عنوان ورقم هاتف الاستلام." : "Please provide a valid pickup address and phone number.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (isCOD && (!bankDetails.bankName || !bankDetails.iban || !bankDetails.accountHolder)) {
        setError(isAr ? "يرجى تعبئة تفاصيل الحساب البنكي لاسترداد مبلغ الدفع عند الاستلام." : "Please provide complete bank details for your COD refund.");
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        orderId: order.id,
        email: order.billing?.email,
        items: selectedItems.map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.selectedQty,
          reason: it.reason || overallReason,
        })),
        overallReason,
        comments,
        returnMethod,
        pickupAddress,
        bankDetails: isCOD ? bankDetails : null,
      };

      const res = await fetch("/api/orders/return-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit return request");
      }

      setSubmittedRma(data.rmaId);
      if (onSuccess) onSuccess(data.rmaId);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-brand-surface border border-brand-border w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
          <div>
            <h3 className="text-xl font-serif text-brand-text">
              {isAr ? `طلب إرجاع واسترداد (طلب #${order.id})` : `Return & Refund Request (Order #${order.id})`}
            </h3>
            <p className="text-xs text-brand-text-muted mt-1">
              {isAr ? "اتباع المعايير المعتمدة للتجارة الإلكترونية في الإمارات" : "UAE Standard E-Commerce Return Application"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-text-muted hover:text-brand-text transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker (if not submitted) */}
        {!submittedRma && (
          <div className="flex border-b border-brand-border bg-brand-bg-secondary px-6 py-3 text-xs uppercase tracking-widest font-medium">
            <span className={step >= 1 ? "text-brand-text font-bold" : "text-brand-text-muted/60"}>
              1. {isAr ? "المنتجات" : "Items"}
            </span>
            <span className="mx-2 text-brand-border">/</span>
            <span className={step >= 2 ? "text-brand-text font-bold" : "text-brand-text-muted/60"}>
              2. {isAr ? "طريقة الإرجاع" : "Method"}
            </span>
            <span className="mx-2 text-brand-border">/</span>
            <span className={step >= 3 ? "text-brand-text font-bold" : "text-brand-text-muted/60"}>
              3. {isAr ? "الاسترداد" : "Settlement"}
            </span>
            <span className="mx-2 text-brand-border">/</span>
            <span className={step >= 4 ? "text-brand-text font-bold" : "text-brand-text-muted/60"}>
              4. {isAr ? "تأكيد" : "Review"}
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 md:p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Screen */}
          {submittedRma ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-serif text-brand-text mb-2">
                  {isAr ? "تم استلام طلب الإرجاع بنجاح" : "Return Request Received"}
                </h4>
                <p className="text-sm text-brand-text-muted">
                  {isAr ? "رقم مرجع الإرجاع (RMA):" : "Return Reference Number (RMA):"}
                </p>
                <div className="inline-block mt-2 px-4 py-2 bg-brand-bg-secondary border border-brand-border font-mono text-base font-semibold text-brand-text">
                  {submittedRma}
                </div>
              </div>

              <div className="max-w-md mx-auto text-sm text-brand-text-muted space-y-3 bg-brand-bg-secondary p-5 border border-brand-border text-start">
                <p className="font-medium text-brand-text">
                  {isAr ? "الخطوات التالية:" : "Next Steps:"}
                </p>
                <ul className="list-disc ps-5 space-y-1.5 text-xs leading-relaxed">
                  <li>
                    {isAr
                      ? "يُرجى إبقاء زجاجة العطر مغلقة داخل غلافها الأصلي مع سلامة شريط الأمان."
                      : "Please ensure the perfume bottle remains unopened inside its original box with seals intact."}
                  </li>
                  {returnMethod === "courier_pickup" ? (
                    <li>
                      {isAr
                        ? `سيتواصل معكم مندوب شركة التوصيل خلال 24-48 ساعة لاستلام الشحنة من: ${pickupAddress.city}`
                        : `Our courier will contact you within 24–48 hours for collection at: ${pickupAddress.city}.`}
                    </li>
                  ) : (
                    <li>
                      {isAr
                        ? "يمكنكم تسليم المنتج في متجرنا: دبي، ديرة، شارع الضغاية، مبنى الزرعوني، محل 11 و 12."
                        : "You can drop off the package at: Shop 11 & 12, Al Zarouni Building, Deira, Dubai."}
                    </li>
                  )}
                  <li>
                    {isTabby
                      ? (isAr
                          ? "بمجرد فحص واستلام المنتج، سيتم إلغاء أقساط تابي تلقائياً وإعادة ما تم دفعه لبطاقتكم."
                          : "Once the item is inspected, your Tabby installments will be automatically cancelled and refunded.")
                      : (isAr
                          ? "ستتم معالجة الاسترداد المالي مباشرة فور إتمام فحص الجودة."
                          : "Your refund will be released immediately upon inspection approval.")}
                  </li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="bg-brand-text text-white py-3 px-8 text-xs uppercase tracking-widest hover:bg-black transition-colors"
              >
                {isAr ? "إغلاق" : "Done"}
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: Select Items & Reason */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-brand-text mb-1">
                      {isAr ? "حدد المنتجات المراد إرجاعها" : "Select the Items You Wish to Return"}
                    </h4>
                    <p className="text-xs text-brand-text-muted">
                      {isAr ? "يجب أن تكون العطور غير مفتوحة وبغلافها الأصلي بحسب شروط الصحة والسلامة." : "Perfumes must be unopened and sealed per health and safety guidelines."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 border transition-colors flex items-center justify-between gap-4 ${
                          item.isSelected ? "border-brand-text bg-brand-bg-secondary" : "border-brand-border bg-brand-surface"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.isSelected}
                            onChange={() => toggleItemSelect(item.id)}
                            className="w-4 h-4 text-brand-text border-brand-border rounded focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <p className="text-sm font-medium text-brand-text">{item.name}</p>
                            <p className="text-xs text-brand-text-muted">
                              {isAr ? "الكمية المشتراة:" : "Purchased Qty:"} {item.quantity}
                            </p>
                          </div>
                        </div>

                        {item.isSelected && item.quantity > 1 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-text-muted">{isAr ? "الكمية:" : "Qty:"}</span>
                            <select
                              value={item.selectedQty}
                              onChange={(e) => updateItemQty(item.id, parseInt(e.target.value, 10))}
                              className="text-xs border border-brand-border bg-brand-surface p-1.5 focus:outline-none"
                            >
                              {Array.from({ length: item.quantity }, (_, i) => i + 1).map((q) => (
                                <option key={q} value={q}>
                                  {q}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-brand-border">
                    <label className="block text-xs font-medium uppercase tracking-wider text-brand-text mb-2">
                      {isAr ? "سبب الإرجاع الأساسي:" : "Primary Return Reason:"}
                    </label>
                    <select
                      value={overallReason}
                      onChange={(e) => setOverallReason(e.target.value)}
                      className="w-full border border-brand-border bg-brand-surface p-3 text-sm focus:outline-none focus:border-brand-text"
                    >
                      {reasons.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-brand-text mb-2">
                      {isAr ? "ملاحظات إضافية (اختياري):" : "Additional Comments (Optional):"}
                    </label>
                    <textarea
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder={isAr ? "صف المشكلة أو حالة التغليف..." : "Describe the issue or packaging state..."}
                      className="w-full border border-brand-border bg-brand-surface p-3 text-sm focus:outline-none focus:border-brand-text"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Return Method */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-brand-text mb-1">
                      {isAr ? "اختر طريقة استلام المرتجع" : "Choose Your Return Method"}
                    </h4>
                    <p className="text-xs text-brand-text-muted">
                      {isAr ? "نوفر خدمة الاستلام من باب المنزل عبر مندوبنا أو التسليم في المتجر." : "Select doorstep pickup across the UAE or drop off in our boutique."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setReturnMethod("courier_pickup")}
                      className={`p-5 border cursor-pointer transition-all ${
                        returnMethod === "courier_pickup"
                          ? "border-brand-text bg-brand-bg-secondary shadow-sm"
                          : "border-brand-border hover:border-brand-text/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Truck className="w-5 h-5 text-brand-text" />
                        <span className="font-medium text-sm text-brand-text">
                          {isAr ? "استلام من باب المنزل" : "Doorstep Courier Pickup"}
                        </span>
                      </div>
                      <p className="text-xs text-brand-text-muted leading-relaxed">
                        {isAr
                          ? "سيصلكم مندوب شركة الشحن لاستلام الطرد من عنوانكم المسجل داخل الإمارات خلال 24-48 ساعة."
                          : "Our courier driver will collect the parcel directly from your door within 1-2 business days."}
                      </p>
                    </div>

                    <div
                      onClick={() => setReturnMethod("store_dropoff")}
                      className={`p-5 border cursor-pointer transition-all ${
                        returnMethod === "store_dropoff"
                          ? "border-brand-text bg-brand-bg-secondary shadow-sm"
                          : "border-brand-border hover:border-brand-text/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Store className="w-5 h-5 text-brand-text" />
                        <span className="font-medium text-sm text-brand-text">
                          {isAr ? "التسليم في المتجر" : "Drop-off at Boutique"}
                        </span>
                      </div>
                      <p className="text-xs text-brand-text-muted leading-relaxed">
                        {isAr
                          ? "مبنى الزرعوني، محل 11 و 12، شارع الضغاية، ديرة، دبي (9:30 ص - 8:30 م)."
                          : "Shop 11 & 12, Al Zarouni Building, Deira, Dubai (Mon-Sat: 9:30 AM - 8:30 PM)."}
                      </p>
                    </div>
                  </div>

                  {returnMethod === "courier_pickup" && (
                    <div className="pt-4 border-t border-brand-border space-y-4">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-brand-text">
                        {isAr ? "عنوان وبيانات استلام الشحنة" : "Pickup Location & Contact"}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-brand-text-muted mb-1">{isAr ? "العنوان بالتفصيل" : "Street Address"}</label>
                          <input
                            type="text"
                            required
                            value={pickupAddress.address}
                            onChange={(e) => setPickupAddress({ ...pickupAddress, address: e.target.value })}
                            className="w-full border border-brand-border bg-brand-surface p-3 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-text-muted mb-1">{isAr ? "المدينة / الإمارة" : "City / Emirate"}</label>
                          <input
                            type="text"
                            required
                            value={pickupAddress.city}
                            onChange={(e) => setPickupAddress({ ...pickupAddress, city: e.target.value })}
                            className="w-full border border-brand-border bg-brand-surface p-3 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-text-muted mb-1">{isAr ? "رقم الهاتف للتواصل" : "Contact Phone"}</label>
                          <input
                            type="text"
                            required
                            value={pickupAddress.phone}
                            onChange={(e) => setPickupAddress({ ...pickupAddress, phone: e.target.value })}
                            className="w-full border border-brand-border bg-brand-surface p-3 text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Settlement Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-brand-text mb-1">
                      {isAr ? "طريقة استرداد الأموال" : "Refund Settlement Details"}
                    </h4>
                    <p className="text-xs text-brand-text-muted">
                      {isAr ? "كيفية إعادة المستحقات بعد فحص المنتج والموافقة على الإرجاع." : "How your funds will be restored upon inspection."}
                    </p>
                  </div>

                  {isTabby && (
                    <div className="p-5 border border-brand-border bg-brand-bg-secondary space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-brand-text">
                          {isAr ? "الدفع بواسطة تابي (Tabby Pay in 4)" : "Paid with Tabby (Pay in 4)"}
                        </span>
                      </div>
                      <p className="text-xs text-brand-text-muted leading-relaxed">
                        {isAr
                          ? "سيتم استرداد المبلغ عبر تابي تلقائياً: سيتم إلغاء أي دفعات أو أقساط متبقية، وإرجاع الأقساط المسددة مسبقاً إلى بطاقتكم البنكية مباشرة."
                          : "Your refund will be credited directly through Tabby. Any pending installments will be cancelled, and amounts already debited will be reversed back to your card."}
                      </p>
                    </div>
                  )}

                  {!isTabby && !isCOD && (
                    <div className="p-5 border border-brand-border bg-brand-bg-secondary space-y-3">
                      <span className="font-semibold text-sm text-brand-text">
                        {order.payment_method_title || (isAr ? "بطاقة بنكية" : "Credit / Debit Card")}
                      </span>
                      <p className="text-xs text-brand-text-muted leading-relaxed">
                        {isAr
                          ? "ستتم إعادة المبلغ تلقائياً إلى نفس البطاقة البنكية المستخدمة أثناء الشراء خلال 5-7 أيام عمل بحسب البنك المصدر لبطاقتكم."
                          : "The refund will be credited back to the original card used at checkout within 5–7 business days depending on your bank."}
                      </p>
                    </div>
                  )}

                  {isCOD && (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                        {isAr
                          ? "نظراً لأن الطلب تم سداده نقداً عند الاستلام، يُرجى تزويدنا بالحساب البنكي لتحويل المبلغ عبر التحويل البنكي المباشر داخل الإمارات."
                          : "Because this order was paid via Cash on Delivery, please provide your UAE bank details to receive a direct bank transfer."}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-brand-text-muted mb-1">{isAr ? "اسم صاحب الحساب" : "Account Holder Name"}</label>
                          <input
                            type="text"
                            required
                            value={bankDetails.accountHolder}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                            className="w-full border border-brand-border bg-brand-surface p-3 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-text-muted mb-1">{isAr ? "اسم البنك (مثال: بنك الإمارات دبي الوطني)" : "Bank Name (e.g. Emirates NBD)"}</label>
                          <input
                            type="text"
                            required
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                            className="w-full border border-brand-border bg-brand-surface p-3 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-text-muted mb-1">{isAr ? "رقم الآيبان (IBAN يبدأ بـ AE)" : "IBAN (Starts with AE)"}</label>
                          <input
                            type="text"
                            required
                            placeholder="AE000000000000000000000"
                            value={bankDetails.iban}
                            onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value.toUpperCase() })}
                            className="w-full border border-brand-border bg-brand-surface p-3 text-sm focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Review & Submit */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-brand-text mb-1">
                      {isAr ? "مراجعة وتأكيد طلب الإرجاع" : "Review & Confirm Return Application"}
                    </h4>
                    <p className="text-xs text-brand-text-muted">
                      {isAr ? "تأكد من صحة البيانات قبل إرسال الطلب لفريق المتابعة." : "Verify your details before submitting to our fulfillment team."}
                    </p>
                  </div>

                  <div className="bg-brand-bg-secondary p-5 border border-brand-border space-y-4 text-xs">
                    <div>
                      <span className="text-brand-text-muted uppercase tracking-wider block mb-1">
                        {isAr ? "المنتجات المحددة:" : "Items to Return:"}
                      </span>
                      <ul className="list-disc ps-5 space-y-1 font-medium text-brand-text">
                        {selectedItems.map((item) => (
                          <li key={item.id}>
                            {item.name} × {item.selectedQty}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-brand-border">
                      <div>
                        <span className="text-brand-text-muted uppercase tracking-wider block mb-1">
                          {isAr ? "السبب:" : "Reason:"}
                        </span>
                        <p className="text-brand-text font-medium">{overallReason}</p>
                      </div>
                      <div>
                        <span className="text-brand-text-muted uppercase tracking-wider block mb-1">
                          {isAr ? "طريقة الاستلام:" : "Collection Method:"}
                        </span>
                        <p className="text-brand-text font-medium">
                          {returnMethod === "courier_pickup"
                            ? (isAr ? `مندوب (${pickupAddress.city})` : `Courier Pickup (${pickupAddress.city})`)
                            : (isAr ? "تسليم بالمتجر (ديرة، دبي)" : "Store Drop-off (Deira, Dubai)")}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-border">
                      <span className="text-brand-text-muted uppercase tracking-wider block mb-1">
                        {isAr ? "آلية الاسترداد المالي:" : "Settlement Method:"}
                      </span>
                      <p className="text-brand-text font-medium">
                        {isTabby
                          ? (isAr ? "إلغاء أقساط تابي واسترداد المدفوع" : "Tabby installment plan reversal")
                          : isCOD
                          ? (isAr ? `تحويل بنكي (${bankDetails.bankName} - ${bankDetails.iban})` : `Bank Transfer (${bankDetails.bankName} - ${bankDetails.iban})`)
                          : (isAr ? `البطاقة الأصلية (${order.payment_method_title})` : `Original Card (${order.payment_method_title})`)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-brand-border mt-8">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as any)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-text hover:opacity-70 transition-opacity"
                  >
                    {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {isAr ? "السابق" : "Back"}
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-brand-text text-white py-3 px-8 text-xs uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2"
                  >
                    <span>{isAr ? "التالي" : "Continue"}</span>
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="bg-brand-text text-white py-3 px-8 text-xs uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isAr ? "جاري الإرسال..." : "Submitting..."}</span>
                      </>
                    ) : (
                      <span>{isAr ? "إرسال طلب الإرجاع" : "Submit Return Request"}</span>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
