import Link from "next/link";
import { PaymentMethods } from "@/components/common/PaymentMethods";

export function MerchantDisclosure() {
  return (
    <div className="bg-brand-surface border border-brand-border p-6 mb-8 text-sm text-brand-text-muted space-y-4">
      <div className="border-b border-brand-border pb-4">
        <h4 className="font-medium text-brand-text mb-2">Boss General Trading LLC</h4>
        <p>Shop No: 11 & 12, Al Zarouni Building, Near Kuwait Mosque, Al Dhagaya Street, Deira, Dubai, UAE</p>
        <p className="mt-2 text-xs">All prices displayed on this website are in United Arab Emirates Dirham (AED).</p>
      </div>
      
      <div className="py-2">
        <PaymentMethods />
      </div>

      <div className="border-t border-brand-border pt-4 text-xs">
        <p className="mb-2">By placing your order, you agree to our policies:</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/terms" className="hover:text-brand-text underline transition-colors">Terms & Conditions</Link>
          <Link href="/privacy" className="hover:text-brand-text underline transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-brand-text underline transition-colors">Refund Policy</Link>
          <Link href="/shipping" className="hover:text-brand-text underline transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
