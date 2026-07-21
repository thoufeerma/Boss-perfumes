export const metadata = {
  title: "Refund & Return Policy | Boss Perfumes",
  description: "Refund and return policy for Boss Perfumes.",
};

export default function RefundPage() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">Refund & Return Policy</h1>
        
        <div className="prose prose-brand max-w-none text-brand-text-muted">
          <p className="mb-6">
            At <strong>Boss General Trading LLC</strong>, we want you to be completely satisfied with your purchase. 
            If you are not entirely happy with your order, we're here to help. Please review our policy regarding returns and refunds for perfume products.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. Eligibility for Returns</h2>
          <p className="mb-6">
            Due to the nature of our products, we only accept returns for items that are unused, unopened, and in their original packaging with all seals intact. 
            Used or opened perfumes cannot be returned for hygiene and safety reasons.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. Time Limits</h2>
          <p className="mb-6">
            You have <strong>14 days</strong> from the date of delivery to request a return or exchange. 
            Requests made after this 14-day period will not be accepted.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. Damaged or Incorrect Products</h2>
          <p className="mb-6">
            If you receive a damaged product or an incorrect item, please contact us immediately upon receipt. 
            We will arrange for a replacement or a full refund, including any shipping charges incurred. Please provide photographic evidence of the damage to assist us in processing your claim.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. Non-Returnable Items</h2>
          <p className="mb-6">
            The following items are strictly non-returnable:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-6">
            <li>Opened or used perfumes and fragrances.</li>
            <li>Products with tampered or broken seals.</li>
            <li>Items purchased on final sale or clearance.</li>
          </ul>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. Refund Processing</h2>
          <p className="mb-6">
            Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. 
            If approved, the refund will be processed and automatically applied to your original method of payment (Visa or Mastercard) within a certain number of days, depending on your card issuer's policies.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. Shipping Responsibility</h2>
          <p className="mb-6">
            You will be responsible for paying your own shipping costs for returning your item, unless the return is due to a defect or an error on our part. 
            Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. Contact Details for Returns</h2>
          <p className="mb-6">
            To initiate a return, please contact our customer service team:<br/>
            Email: <a href="mailto:brbossperfumes@gmail.com" className="text-brand-text underline hover:text-brand-accent">brbossperfumes@gmail.com</a><br/>
            Phone: +971 4 235 6130
          </p>
          
          <div className="mt-12 pt-8 border-t border-brand-border text-sm text-center">
            <p>Last Updated: July 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
