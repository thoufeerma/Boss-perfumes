export function PaymentMethods({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Visa Icon */}
        <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm flex items-center justify-center w-[3.25rem] h-8">
          <img src="/footer%20payment/visa-brandmark-blue-1960x622.png" alt="Visa" className="h-full w-full object-contain" />
        </div>
        
        {/* Mastercard Icon */}
        <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm flex items-center justify-center w-[3.25rem] h-8">
          <img src="/footer%20payment/ma_symbol_opt_73_3x.png" alt="Mastercard" className="h-full w-full object-contain" />
        </div>
        
        {/* Amex Icon */}
        <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm flex items-center justify-center w-[3.25rem] h-8">
          <img src="/footer%20payment/Amex_logo_color.png" alt="American Express" className="h-full w-full object-contain" />
        </div>
        
        {/* Apple Pay Icon */}
        <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm flex items-center justify-center w-[3.25rem] h-8">
          <img src="/footer%20payment/apple-pay.svg" alt="Apple Pay" className="h-full w-full object-contain" />
        </div>
        
        {/* Google Pay Icon */}
        <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm flex items-center justify-center w-[3.25rem] h-8">
          <img src="/footer%20payment/google-pay.svg" alt="Google Pay" className="h-full w-full object-contain" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-brand-text-muted mt-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span className="font-medium">SSL Encrypted / Secure Checkout</span>
      </div>
    </div>
  );
}
