"use client";

import { useTransition, useState } from "react";
import { updateAddress } from "@/app/account/addresses/actions";

type AddressData = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
  state: string;
  email?: string;
  phone?: string;
};

export function AddressForm({ type, data }: { type: "billing" | "shipping", data: AddressData }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updateAddress(type, formData);
      if (!result.success) {
        setError(result.error || "Something went wrong.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-600 text-sm border border-green-200">Address updated successfully!</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">First Name</label>
          <input type="text" name="first_name" defaultValue={data?.first_name} className="w-full border border-brand-border p-3 text-sm focus:outline-none" required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">Last Name</label>
          <input type="text" name="last_name" defaultValue={data?.last_name} className="w-full border border-brand-border p-3 text-sm focus:outline-none" required />
        </div>
      </div>
      
      <div>
        <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">Company Name (Optional)</label>
        <input type="text" name="company" defaultValue={data?.company} className="w-full border border-brand-border p-3 text-sm focus:outline-none" />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">Street Address</label>
        <input type="text" name="address_1" defaultValue={data?.address_1} placeholder="House number and street name" className="w-full border border-brand-border p-3 text-sm focus:outline-none mb-3" required />
        <input type="text" name="address_2" defaultValue={data?.address_2} placeholder="Apartment, suite, unit, etc. (optional)" className="w-full border border-brand-border p-3 text-sm focus:outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">Town / City</label>
          <input type="text" name="city" defaultValue={data?.city} className="w-full border border-brand-border p-3 text-sm focus:outline-none" required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">State / County</label>
          <input type="text" name="state" defaultValue={data?.state} className="w-full border border-brand-border p-3 text-sm focus:outline-none" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">Postcode / ZIP</label>
          <input type="text" name="postcode" defaultValue={data?.postcode} className="w-full border border-brand-border p-3 text-sm focus:outline-none" required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">Country / Region</label>
          <input type="text" name="country" defaultValue={data?.country} className="w-full border border-brand-border p-3 text-sm focus:outline-none" required />
        </div>
      </div>

      {type === "billing" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">Phone</label>
            <input type="tel" name="phone" defaultValue={data?.phone} className="w-full border border-brand-border p-3 text-sm focus:outline-none" required />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-brand-text mb-2">Email Address</label>
            <input type="email" name="email" defaultValue={data?.email} className="w-full border border-brand-border p-3 text-sm focus:outline-none" required />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto bg-[#111111] text-white py-3 px-8 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-70 mt-4"
      >
        {isPending ? "Saving..." : "Save Address"}
      </button>
    </form>
  );
}
