import { requireAuthenticatedCustomer } from "@/lib/authGuard";
import { fetchWC } from "@/api/client";
import Link from "next/link";

export const metadata = {
  title: "Order Details | My Account",
};

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const customer = await requireAuthenticatedCustomer();
  let order: any = null;

  try {
    const fetchedOrder = await fetchWC(`orders/${params.id}`);
    
    // Verify ownership securely
    if (fetchedOrder && fetchedOrder.customer_id === customer.id) {
      order = fetchedOrder;
    }
  } catch (error) {
    console.error("Failed to fetch order", error);
  }

  if (!order) {
    return (
      <div className="bg-brand-surface border border-brand-border p-8 md:p-12 text-center">
        <h2 className="text-2xl font-serif text-brand-text mb-4">Order Not Found</h2>
        <p className="text-brand-text-muted mb-8 font-light">This order doesn't exist or you don't have permission to view it.</p>
        <Link href="/account/orders" className="inline-block bg-[#111111] text-white py-3 px-8 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface border border-brand-border p-8 md:p-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-8 border-b border-brand-border">
        <div>
          <h2 className="text-2xl font-serif text-brand-text mb-2">Order #{order.id}</h2>
          <p className="text-sm text-brand-text-muted font-light">
            Placed on {new Date(order.date_created).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-block px-3 py-1 bg-brand-bg-secondary text-brand-text text-xs uppercase tracking-widest border border-brand-border">
            {order.status}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-4">Billing Address</h3>
          <div className="text-sm text-brand-text-muted font-light leading-relaxed p-4 bg-brand-bg-secondary border border-brand-border">
            {order.billing.first_name} {order.billing.last_name}<br />
            {order.billing.company && <>{order.billing.company}<br /></>}
            {order.billing.address_1}<br />
            {order.billing.address_2 && <>{order.billing.address_2}<br /></>}
            {order.billing.city}, {order.billing.state} {order.billing.postcode}<br />
            {order.billing.country}<br />
            <span className="mt-2 block">Email: {order.billing.email}</span>
            <span className="block">Phone: {order.billing.phone}</span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-4">Shipping Address</h3>
          <div className="text-sm text-brand-text-muted font-light leading-relaxed p-4 bg-brand-bg-secondary border border-brand-border h-full">
            {order.shipping.first_name} {order.shipping.last_name}<br />
            {order.shipping.company && <>{order.shipping.company}<br /></>}
            {order.shipping.address_1}<br />
            {order.shipping.address_2 && <>{order.shipping.address_2}<br /></>}
            {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}<br />
            {order.shipping.country}
          </div>
        </div>
      </div>

      <h3 className="text-sm font-medium tracking-widest uppercase text-brand-text mb-4">Order Items</h3>
      <div className="overflow-x-auto mb-8 border border-brand-border">
        <table className="w-full text-left text-sm text-brand-text">
          <thead className="bg-brand-bg-secondary border-b border-brand-border uppercase tracking-widest text-xs font-medium text-brand-text-muted">
            <tr>
              <th className="py-4 px-4 font-normal">Product</th>
              <th className="py-4 px-4 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {order.line_items.map((item: any) => (
              <tr key={item.id}>
                <td className="py-4 px-4">
                  <div className="font-medium mb-1">{item.name}</div>
                  <div className="text-xs text-brand-text-muted">Quantity: {item.quantity}</div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span dangerouslySetInnerHTML={{ __html: order.currency_symbol }} />
                  {parseFloat(item.total).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-brand-bg-secondary divide-y divide-brand-border">
            <tr>
              <th className="py-3 px-4 text-right font-normal text-xs uppercase tracking-widest text-brand-text-muted">Subtotal:</th>
              <td className="py-3 px-4 text-right font-medium">
                <span dangerouslySetInnerHTML={{ __html: order.currency_symbol }} />
                {parseFloat(order.total) - parseFloat(order.total_tax) - parseFloat(order.shipping_total)}
              </td>
            </tr>
            <tr>
              <th className="py-3 px-4 text-right font-normal text-xs uppercase tracking-widest text-brand-text-muted">Shipping:</th>
              <td className="py-3 px-4 text-right font-medium">
                <span dangerouslySetInnerHTML={{ __html: order.currency_symbol }} />
                {parseFloat(order.shipping_total).toFixed(2)}
              </td>
            </tr>
            <tr>
              <th className="py-3 px-4 text-right font-normal text-xs uppercase tracking-widest text-brand-text-muted">Payment Method:</th>
              <td className="py-3 px-4 text-right font-medium">
                {order.payment_method_title}
              </td>
            </tr>
            <tr>
              <th className="py-4 px-4 text-right font-medium text-sm uppercase tracking-widest text-brand-text">Total:</th>
              <td className="py-4 px-4 text-right font-medium text-lg">
                <span dangerouslySetInnerHTML={{ __html: order.currency_symbol }} />
                {parseFloat(order.total).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8 text-center">
        <Link href="/account/orders" className="text-xs uppercase tracking-widest text-brand-text underline underline-offset-4 hover:opacity-70 transition-opacity">
          &larr; Back to all orders
        </Link>
      </div>
    </div>
  );
}
