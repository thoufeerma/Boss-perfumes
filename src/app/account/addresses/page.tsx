import { requireAuthenticatedCustomer } from "@/lib/authGuard";
import { AddressForm } from "@/components/account/AddressForm";

export const metadata = {
  title: "Addresses | My Account",
};

export default async function AddressesPage() {
  const customerData = await requireAuthenticatedCustomer();

  if (!customerData) {
    return (
      <div className="bg-brand-surface border border-brand-border p-8 md:p-12 text-center">
        <p className="text-brand-text-muted">Could not load customer data.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface border border-brand-border p-8 md:p-12">
      <h2 className="text-2xl font-serif text-brand-text mb-2">Addresses</h2>
      <p className="text-brand-text-muted font-light leading-relaxed mb-8">
        The following addresses will be used on the checkout page by default.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6 border-b border-brand-border pb-4">
            Billing Address
          </h3>
          <AddressForm type="billing" data={customerData.billing || {}} />
        </div>
        
        <div>
          <h3 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-6 border-b border-brand-border pb-4">
            Shipping Address
          </h3>
          <AddressForm type="shipping" data={customerData.shipping || {}} />
        </div>
      </div>
    </div>
  );
}
