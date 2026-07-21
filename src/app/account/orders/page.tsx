import { requireAuthenticatedCustomer } from "@/lib/authGuard";
import { fetchWC } from "@/api/client";
import Link from "next/link";

export const metadata = {
  title: "Orders | My Account",
};

export default async function OrdersPage() {
  const customer = await requireAuthenticatedCustomer();

  let orders: any[] = [];
  try {
    orders = await fetchWC(`orders?customer=${customer.id}`);
  } catch (error) {
    console.error("Failed to fetch orders", error);
  }

  return (
    <div className="bg-brand-surface border border-brand-border p-8 md:p-12">
      <h2 className="text-2xl font-serif text-brand-text mb-6">Orders</h2>
      
      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-text">
            <thead className="border-b border-brand-border uppercase tracking-widest text-xs font-medium text-brand-text-muted">
              <tr>
                <th className="pb-4 pr-4 font-normal">Order</th>
                <th className="pb-4 px-4 font-normal">Date</th>
                <th className="pb-4 px-4 font-normal">Status</th>
                <th className="pb-4 px-4 font-normal">Total</th>
                <th className="pb-4 pl-4 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-bg-secondary transition-colors">
                  <td className="py-6 pr-4">#{order.id}</td>
                  <td className="py-6 px-4">{new Date(order.date_created).toLocaleDateString()}</td>
                  <td className="py-6 px-4 capitalize">{order.status}</td>
                  <td className="py-6 px-4">
                    <span dangerouslySetInnerHTML={{ __html: order.currency_symbol }} />
                    {parseFloat(order.total).toFixed(2)} for {order.line_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0} items
                  </td>
                  <td className="py-6 pl-4 text-right">
                    <Link href={`/account/orders/${order.id}`} className="inline-block bg-[#111111] text-white py-2 px-6 text-xs tracking-widest uppercase hover:bg-black transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-brand-bg-secondary border border-brand-border">
          <p className="text-brand-text-muted mb-4 font-light">You haven't placed any orders yet.</p>
          <Link href="/collections" className="inline-block bg-[#111111] text-white py-3 px-8 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
