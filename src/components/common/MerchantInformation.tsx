import { PaymentMethods } from "./PaymentMethods";

export function MerchantInformation({ className = "" }: { className?: string }) {
  return (
    <div className={`text-sm text-brand-text-muted space-y-6 ${className}`}>
      <div>
        <h4 className="font-medium text-brand-text uppercase tracking-widest mb-2">Company Information</h4>
        <p className="font-medium text-brand-text">Boss General Trading LLC</p>
        <p>Shop No: 11 & 12, Al Zarouni Building</p>
        <p>Near Kuwait Mosque, Al Dhagaya Street</p>
        <p>Deira, Dubai, United Arab Emirates</p>
        <p>P.O. Box: 81130</p>
      </div>

      <div>
        <h4 className="font-medium text-brand-text uppercase tracking-widest mb-2">Contact Us</h4>
        <p>Email: <a href="mailto:brbossperfumes@gmail.com" className="hover:text-brand-text transition-colors">brbossperfumes@gmail.com</a></p>
        <p>Phone: +971 4 235 6130 / +971 4 3983968</p>
      </div>

      <div>
        <h4 className="font-medium text-brand-text uppercase tracking-widest mb-2">Business Hours</h4>
        <p>Monday – Saturday: 9:30 AM – 8:30 PM</p>
        <p>Sunday: Closed</p>
      </div>

      <div>
        <h4 className="font-medium text-brand-text uppercase tracking-widest mb-2">Currency & Payments</h4>
        <p className="mb-3">All prices displayed on this website are in United Arab Emirates Dirham (AED).</p>
        <PaymentMethods />
      </div>
    </div>
  );
}
