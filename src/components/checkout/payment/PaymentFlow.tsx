"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MerchantDisclosure } from "./MerchantDisclosure";
import { useCustomerStore } from "@/store/customer-store";
import { useCartContext } from "@/components/cart/CartProvider";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

function PaymentFlowSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <section>
        <div className="h-4 w-40 bg-brand-border mb-6"></div>
        <div className="space-y-4">
          <div className="h-14 w-full bg-brand-surface border border-brand-border"></div>
          <div className="h-14 w-full bg-brand-surface border border-brand-border"></div>
        </div>
      </section>
      
      <section>
        <div className="h-4 w-40 bg-brand-border mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-14 w-full bg-brand-surface border border-brand-border"></div>
          <div className="h-14 w-full bg-brand-surface border border-brand-border"></div>
          <div className="col-span-2 h-14 w-full bg-brand-surface border border-brand-border"></div>
          <div className="h-14 w-full bg-brand-surface border border-brand-border"></div>
          <div className="h-14 w-full bg-brand-surface border border-brand-border"></div>
        </div>
      </section>

      <section>
        <div className="h-4 w-32 bg-brand-border mb-6"></div>
        <div className="h-20 w-full bg-brand-surface border border-brand-border mb-6"></div>
      </section>

      <div className="h-14 w-full bg-brand-border"></div>
    </div>
  );
}

const isValidUAEPhone = (phone: string) => {
  // Matches +971501234567, 00971501234567, 0501234567, etc.
  const cleanPhone = phone.replace(/\s+/g, '');
  const uaePhoneRegex = /^(?:\+971|00971|0)?(?:50|52|54|55|56|58|2|3|4|6|7|9)\d{7}$/;
  return uaePhoneRegex.test(cleanPhone);
};

const normalizeUAEPhone = (phone: string) => {
  const cleanPhone = phone.replace(/\s+/g, '');
  if (cleanPhone.startsWith('00971')) return '+' + cleanPhone.substring(2);
  if (cleanPhone.startsWith('05') || cleanPhone.startsWith('02') || cleanPhone.startsWith('03') || cleanPhone.startsWith('04') || cleanPhone.startsWith('06') || cleanPhone.startsWith('07') || cleanPhone.startsWith('09')) {
    return '+971' + cleanPhone.substring(1);
  }
  if (cleanPhone.startsWith('5')) {
    return '+971' + cleanPhone;
  }
  return cleanPhone;
};

const COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'OM', name: 'Oman' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'QA', name: 'Qatar' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'EG', name: 'Egypt' },
  { code: 'JO', name: 'Jordan' },
  { code: 'LB', name: 'Lebanon' }
];

export function PaymentFlow() {
  const { profile, isLoading, fetchProfile, updateProfile } = useCustomerStore();
  const { cart } = useCartContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("checkoutcom");
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  
  const [countryQuery, setCountryQuery] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const [form, setForm] = useState({
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    postcode: "",
    country: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      const initCountry = profile.shipping?.country || profile.billing?.country || "";
      const countryObj = COUNTRIES.find(c => c.code === initCountry);
      setForm({
        email: profile.billing?.email || profile.email || "",
        phone: profile.billing?.phone || "",
        first_name: profile.shipping?.first_name || profile.billing?.first_name || profile.first_name || "",
        last_name: profile.shipping?.last_name || profile.billing?.last_name || profile.last_name || "",
        address_1: profile.shipping?.address_1 || profile.billing?.address_1 || "",
        city: profile.shipping?.city || profile.billing?.city || "",
        postcode: profile.shipping?.postcode || profile.billing?.postcode || "",
        country: initCountry,
      });
      if (countryObj) {
        setCountryQuery(`${countryObj.name} (${countryObj.code})`);
      }
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!isValidUAEPhone(form.phone)) {
      setError("Please enter a valid UAE mobile number (e.g. 0501234567)");
      setIsProcessing(false);
      return;
    }

    const normalizedPhone = normalizeUAEPhone(form.phone);

    const billing = {
      first_name: form.first_name,
      last_name: form.last_name,
      address_1: form.address_1,
      address_2: "",
      city: form.city,
      state: "",
      postcode: form.postcode,
      country: form.country || "AE",
      email: form.email,
      phone: normalizedPhone,
    };

    const shipping = {
      first_name: form.first_name,
      last_name: form.last_name,
      address_1: form.address_1,
      address_2: "",
      city: form.city,
      state: "",
      postcode: form.postcode,
      country: form.country || "AE",
    };

    try {
      // 1. Update customer profile if authenticated
      if (profile) {
        const updated = await updateProfile({ billing, shipping });
        if (!updated) {
          throw new Error("Failed to update customer profile. Please try again.");
        }
      }

      // 2. Create payment session
      const response = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          billing, 
          shipping,
          paymentMethod: selectedPaymentMethod,
          existingOrderId: createdOrderId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.orderId) {
          // If order was created but session failed, save the orderId so we don't duplicate on retry
          setCreatedOrderId(data.orderId);
        }
        throw new Error(data.message || data.error || "Failed to initiate payment");
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No redirect URL returned from payment provider");
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. You can try selecting a different payment method.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <PaymentFlowSkeleton />;
  }

  return (
    <form className="space-y-12" onSubmit={handleSubmit}>
      <section>
        <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6">Contact Information</h2>
        <div className="space-y-4">
          <input 
            type="email" 
            name="email"
            required
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email" 
            className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors"
          />
          <input 
            type="tel" 
            name="phone"
            required
            value={form.phone}
            onChange={handleInputChange}
            placeholder="Mobile Number" 
            className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6">Shipping Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="first_name" required value={form.first_name} onChange={handleInputChange} placeholder="First Name" className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
          <input type="text" name="last_name" required value={form.last_name} onChange={handleInputChange} placeholder="Last Name" className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
          <input type="text" name="address_1" required value={form.address_1} onChange={handleInputChange} placeholder="Address" className="col-span-2 w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
          <input type="text" name="city" required value={form.city} onChange={handleInputChange} placeholder="City" className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
          <input type="text" name="postcode" required value={form.postcode} onChange={handleInputChange} placeholder="Postal Code" className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors" />
          <div className="col-span-2 relative" ref={countryRef}>
            <input 
              type="text" 
              placeholder="Country"
              required
              value={countryQuery}
              onChange={(e) => {
                setCountryQuery(e.target.value);
                setShowCountryDropdown(true);
                setForm(prev => ({ ...prev, country: "" })); // Clear actual value until selected
              }}
              onFocus={() => setShowCountryDropdown(true)}
              className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors"
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-brand-text">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            
            {showCountryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-brand-surface border border-brand-border shadow-lg max-h-60 overflow-auto">
                {COUNTRIES.filter(c => c.name.toLowerCase().includes(countryQuery.toLowerCase()) || c.code.toLowerCase().includes(countryQuery.toLowerCase())).length > 0 ? (
                  COUNTRIES.filter(c => c.name.toLowerCase().includes(countryQuery.toLowerCase()) || c.code.toLowerCase().includes(countryQuery.toLowerCase())).map(c => (
                    <div 
                      key={c.code}
                      className="p-4 cursor-pointer hover:bg-gray-50 text-brand-text text-sm border-b border-brand-border/30 last:border-0"
                      onClick={() => {
                        setForm(prev => ({ ...prev, country: c.code }));
                        setCountryQuery(`${c.name} (${c.code})`);
                        setShowCountryDropdown(false);
                      }}
                    >
                      {c.name} ({c.code})
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-brand-text-muted">No countries found</div>
                )}
              </div>
            )}
            <input type="hidden" name="country" value={form.country} required />
          </div>
        </div>
      </section>

      <section>
        <PaymentMethodSelector 
          cartData={cart} 
          billingData={form}
          selectedMethod={selectedPaymentMethod} 
          onSelect={setSelectedPaymentMethod} 
        />
        <div className="bg-brand-surface border border-brand-border p-6 text-center text-brand-text-muted text-sm mb-6 mt-6">
          You will be redirected securely to complete your payment.
        </div>
        <MerchantDisclosure />
      </section>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 text-sm border border-red-100">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isProcessing}
        className="w-full bg-brand-text text-white py-4 text-sm font-medium tracking-widest uppercase hover:bg-brand-accent transition-colors duration-300 disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
}
