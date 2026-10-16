"use client";

import { Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

export function ShippingInfo() {
  const t = useT();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 mt-8 border-t border-gray-100">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Truck className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        <span className="font-medium">{t.product.expressDelivery}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <ShieldCheck className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        <span className="font-medium">{t.product.securePayment}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <RefreshCw className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        <span className="font-medium">{t.product.easyReturns}</span>
      </div>
    </div>
  );
}
