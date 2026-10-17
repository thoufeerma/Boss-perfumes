import { requireAuthenticatedCustomer } from "@/lib/authGuard";
import { fetchWC } from "@/api/client";
import Link from "next/link";
import { RotateCcw, Clock, CheckCircle2, Package } from "lucide-react";
import { getLocale } from "@/lib/i18n/server";

export const metadata = {
  title: "Returns & Refunds | My Account",
};

export default async function AccountReturnsPage() {
  const customer = await requireAuthenticatedCustomer();
  const locale = await getLocale();
  const isAr = locale === "ar";

  let orders: any[] = [];
  try {
    orders = await fetchWC(`orders?customer=${customer.id}`);
  } catch (error) {
    console.error("Failed to fetch customer orders for returns", error);
  }

  // Separate orders with active return requests or refunded
  const ordersWithReturns = orders.filter((o) => {
    const hasReturnMeta = o.meta_data?.some((m: any) => m.key === "_return_request");
    return hasReturnMeta || o.status === "refunded";
  });

  const eligibleOrders = orders.filter((o) => {
    const hasReturnMeta = o.meta_data?.some((m: any) => m.key === "_return_request");
    const isRefunded = o.status === "refunded";
    const isCancelled = o.status === "cancelled";
    return !hasReturnMeta && !isRefunded && !isCancelled;
  });

  return (
    <div className="bg-brand-surface border border-brand-border p-8 md:p-12" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-brand-border">
        <div>
          <h2 className="text-2xl font-serif text-brand-text mb-1">
            {isAr ? "طلبات الإرجاع والاسترداد" : "Returns & Refunds"}
          </h2>
          <p className="text-xs text-brand-text-muted">
            {isAr
              ? "متابعة وإدارة طلبات استرجاع المنتجات واسترداد الأموال لطلباتك."
              : "Track and manage your return requests and refund status."}
          </p>
        </div>

        <Link
          href="/returns"
          className="inline-flex items-center gap-2 bg-[#111111] text-white py-2.5 px-5 text-xs uppercase tracking-widest hover:bg-black transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isAr ? "تقديم طلب إرجاع جديد" : "New Return Request"}</span>
        </Link>
      </div>

      {/* Active Return Requests */}
      {ordersWithReturns.length > 0 && (
        <div className="space-y-6 mb-12">
          <h3 className="text-sm font-medium uppercase tracking-widest text-brand-text">
            {isAr ? "طلبات الإرجاع النشطة والمستردة" : "Active & Processed Return Requests"}
          </h3>

          <div className="space-y-4">
            {ordersWithReturns.map((order) => {
              const returnMeta = order.meta_data?.find((m: any) => m.key === "_return_request")?.value;
              const returnStatus = order.meta_data?.find((m: any) => m.key === "_return_request_status")?.value;
              const isRefunded = order.status === "refunded";

              return (
                <div
                  key={order.id}
                  className="p-6 bg-brand-bg-secondary border border-brand-border space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-border">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-base text-brand-text font-medium">
                          {isAr ? `طلب #${order.id}` : `Order #${order.id}`}
                        </span>
                        {returnMeta?.id && (
                          <span className="text-xs font-mono px-2 py-0.5 bg-brand-surface border border-brand-border text-brand-text-muted">
                            {returnMeta.id}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-text-muted mt-0.5">
                        {isAr ? "تاريخ الطلب:" : "Order Date:"} {new Date(order.date_created).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      {isRefunded ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs uppercase font-medium tracking-wider rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAr ? "تم الاسترداد" : "Refunded"}</span>
                        </span>
                      ) : returnStatus === "approved" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-xs uppercase font-medium tracking-wider rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAr ? "تمت الموافقة" : "Approved"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs uppercase font-medium tracking-wider rounded">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isAr ? "قيد المراجعة" : "Pending Review"}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-brand-text-muted">
                    <div>
                      <span className="uppercase tracking-wider font-medium text-brand-text block mb-1">
                        {isAr ? "المنتجات:" : "Products:"}
                      </span>
                      <p className="line-clamp-2">
                        {order.line_items?.map((it: any) => it.name).join(", ")}
                      </p>
                    </div>

                    <div>
                      <span className="uppercase tracking-wider font-medium text-brand-text block mb-1">
                        {isAr ? "طريقة الإرجاع:" : "Collection Method:"}
                      </span>
                      <p>
                        {returnMeta?.returnMethod === "courier_pickup"
                          ? (isAr ? "استلام من باب المنزل (مندوب)" : "Doorstep Courier Pickup")
                          : (isAr ? "تسليم بالمتجر (دبي، ديرة)" : "Boutique Drop-off (Deira, Dubai)")}
                      </p>
                    </div>

                    <div>
                      <span className="uppercase tracking-wider font-medium text-brand-text block mb-1">
                        {isAr ? "المبلغ المسترد:" : "Refund Amount:"}
                      </span>
                      <p className="font-semibold text-brand-text">
                        {parseFloat(order.total).toFixed(2)} AED
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-xs uppercase tracking-widest text-brand-text underline underline-offset-4 hover:opacity-70 transition-opacity"
                    >
                      {isAr ? "عرض تفاصيل الطلب والإرجاع ←" : "View Order & Return Details →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Eligible Orders for Return */}
      <div>
        <h3 className="text-sm font-medium uppercase tracking-widest text-brand-text mb-4">
          {isAr ? "الطلبات المؤهلة للإرجاع" : "Eligible Orders for Return"}
        </h3>

        {eligibleOrders.length > 0 ? (
          <div className="overflow-x-auto border border-brand-border">
            <table className="w-full text-start text-sm text-brand-text">
              <thead className="bg-brand-bg-secondary border-b border-brand-border uppercase tracking-widest text-xs font-medium text-brand-text-muted">
                <tr>
                  <th className="py-4 px-4 font-normal">{isAr ? "الطلب" : "Order"}</th>
                  <th className="py-4 px-4 font-normal">{isAr ? "التاريخ" : "Date"}</th>
                  <th className="py-4 px-4 font-normal">{isAr ? "الإجمالي" : "Total"}</th>
                  <th className="py-4 px-4 text-end font-normal">{isAr ? "الإجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {eligibleOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-bg-secondary/50 transition-colors">
                    <td className="py-4 px-4 font-medium">#{order.id}</td>
                    <td className="py-4 px-4 text-xs text-brand-text-muted">
                      {new Date(order.date_created).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {parseFloat(order.total).toFixed(2)} AED
                    </td>
                    <td className="py-4 px-4 text-end">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-block bg-[#111111] text-white py-1.5 px-4 text-xs tracking-widest uppercase hover:bg-black transition-colors"
                      >
                        {isAr ? "طلب إرجاع" : "Return Item"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : ordersWithReturns.length === 0 ? (
          <div className="text-center py-12 bg-brand-bg-secondary border border-brand-border">
            <Package className="w-10 h-10 text-brand-text-muted mx-auto mb-3" />
            <p className="text-brand-text-muted mb-4 font-light text-sm">
              {isAr ? "ليس لديك أي طلبات مسجلة حالياً للإرجاع." : "You have no return requests or eligible orders at this time."}
            </p>
            <Link
              href="/collections"
              className="inline-block bg-[#111111] text-white py-3 px-8 text-xs font-medium tracking-widest uppercase hover:bg-black transition-colors"
            >
              {isAr ? "تصفح المنتجات" : "Browse Products"}
            </Link>
          </div>
        ) : (
          <p className="text-xs text-brand-text-muted p-4 bg-brand-bg-secondary border border-brand-border">
            {isAr
              ? "جميع طلباتك السابقة مسجلة أعلاه ضمن قسم الإرجاع."
              : "All your eligible orders have return requests registered above."}
          </p>
        )}
      </div>
    </div>
  );
}
