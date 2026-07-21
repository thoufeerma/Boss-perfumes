export const metadata = {
  title: "Shipping Policy | Boss Perfumes",
  description: "Shipping policy and delivery information for Boss Perfumes.",
};

export default function ShippingPage() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">Shipping Policy</h1>
        
        <div className="prose prose-brand max-w-none text-brand-text-muted">
          <p className="mb-6">
            At <strong>Boss General Trading LLC</strong>, we are committed to delivering your favorite luxury perfumes promptly and securely. 
            Please read our shipping policy below to understand our delivery processes, times, and costs.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. Order Processing Time</h2>
          <p className="mb-6">
            All orders are processed within 1 to 2 business days (excluding Sundays and public holidays) after receiving your order confirmation email. 
            You will receive another notification when your order has shipped.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. UAE Shipping</h2>
          <p className="mb-6">
            We offer fast and reliable shipping across the United Arab Emirates.
          </p>
          <ul className="list-disc pl-6 mt-2 mb-6">
            <li><strong>Standard Delivery:</strong> 2-3 business days.</li>
            <li><strong>Express Delivery:</strong> Available in select areas (Dubai, Sharjah) for next-day delivery if ordered before our daily cutoff time.</li>
          </ul>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. International Shipping</h2>
          <p className="mb-6">
            We currently offer international shipping to select countries. Shipping charges for your order will be calculated and displayed at checkout. 
            Delivery times vary depending on the destination, generally ranging from 5 to 14 business days.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. Customs, Duties, and Taxes</h2>
          <p className="mb-6">
            For international orders, <strong>Boss General Trading LLC</strong> is not responsible for any customs and taxes applied to your order. 
            All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. Order Tracking</h2>
          <p className="mb-6">
            Once your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. 
            Please allow up to 24 hours for the tracking information to become available.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. Delivery Delays</h2>
          <p className="mb-6">
            While we strive to ensure timely delivery, there may be occasional delays due to unforeseen circumstances, such as severe weather, carrier delays, or customs holds. 
            We will do our best to keep you informed if we anticipate a significant delay with your order.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. Contact Information</h2>
          <p className="mb-6">
            If you have any questions about the delivery of your order, please contact us at <a href="mailto:brbossperfumes@gmail.com" className="text-brand-text underline hover:text-brand-accent">brbossperfumes@gmail.com</a>.
          </p>
          
          <div className="mt-12 pt-8 border-t border-brand-border text-sm text-center">
            <p>Last Updated: July 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
