import { requireAuthenticatedCustomer } from "@/lib/authGuard";
import { AccountDetailsForm } from "@/components/account/AccountDetailsForm";

export const metadata = {
  title: "Account Details | My Account",
};

export default async function AccountDetailsPage() {
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
      <h2 className="text-2xl font-serif text-brand-text mb-6">Account Details</h2>
      
      <AccountDetailsForm data={{
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
      }} />
    </div>
  );
}
