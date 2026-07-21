import { fetchWC } from "@/api/client";
import { requireAuthenticatedCustomer } from "@/lib/authGuard";
import Link from "next/link";

export default async function AccountDashboardPage() {
  const customerData = await requireAuthenticatedCustomer();

  let recentOrders: any[] = [];
  try {
    if (customerData?.id) {
      recentOrders = await fetchWC(`orders?customer=${customerData.id}&per_page=3`);
    }
  } catch (error) {
    // Ignore fetch errors
  }

  return (
    <div className="bg-brand-surface border border-brand-border p-8 md:p-12">
      <h2 className="text-2xl font-serif text-brand-text mb-6">Dashboard</h2>
      <p className="text-brand-text-muted font-light leading-relaxed max-w-2xl mb-8">
        From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-brand-border p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <ul className="space-y-3 mb-4">
              {recentOrders.map((order: any) => (
                <li key={order.id} className="text-sm text-brand-text-muted flex justify-between">
                  <span>Order #{order.id}</span>
                  <span>{new Date(order.date_created).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-text-muted mb-4 font-light">You have no recent orders.</p>
          )}
          <Link href="/account/orders" className="text-xs uppercase tracking-widest text-brand-text underline underline-offset-4">View All Orders</Link>
        </div>
        <div className="border border-brand-border p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-4">Default Address</h3>
          {customerData?.billing?.address_1 ? (
            <p className="text-sm text-brand-text-muted mb-4 font-light">
              {customerData.billing.first_name} {customerData.billing.last_name}<br />
              {customerData.billing.address_1}<br />
              {customerData.billing.city}, {customerData.billing.state} {customerData.billing.postcode}
            </p>
          ) : (
            <p className="text-sm text-brand-text-muted mb-4 font-light">No default address set.</p>
          )}
          <Link href="/account/addresses" className="text-xs uppercase tracking-widest text-brand-text underline underline-offset-4">Edit Address</Link>
        </div>
      </div>
    </div>
  );
}
