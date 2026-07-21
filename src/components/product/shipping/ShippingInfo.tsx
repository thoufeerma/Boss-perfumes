import { Truck, ShieldCheck, RefreshCw } from "lucide-react";

export function ShippingInfo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 mt-8 border-t border-gray-100">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Truck className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        <span className="font-medium">Express Delivery</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <ShieldCheck className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        <span className="font-medium">Secure Payment</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <RefreshCw className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        <span className="font-medium">Easy Returns</span>
      </div>
    </div>
  );
}
