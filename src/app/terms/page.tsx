export const metadata = {
  title: "Terms & Conditions | Boss Perfumes",
  description: "Terms and conditions for Boss Perfumes, Boss General Trading LLC.",
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">Terms & Conditions</h1>
        
        <div className="prose prose-brand max-w-none text-brand-text-muted">
          <p className="mb-6 text-brand-text font-medium">Welcome to Boss Perfumes.</p>
          
          <p className="mb-6">
            These Terms & Conditions ("Terms") govern your use of the Boss Perfumes website and your purchase of products from us. 
            By accessing or using our website, you agree to be bound by these Terms. 
            The contracting entity for all purchases is <strong>Boss General Trading LLC</strong>.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">1. Contracting Party & Jurisdiction</h2>
          <p className="mb-6">
            When you purchase from our website, your contract is with <strong>Boss General Trading LLC</strong>, a company registered in the <strong>United Arab Emirates</strong>. 
            These Terms are governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Dubai, United Arab Emirates.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">2. Customer Obligations</h2>
          <p className="mb-6">
            By placing an order, you confirm that you are legally capable of entering into binding contracts and that all information you provide is accurate and complete. 
            You agree not to use our products for any illegal or unauthorized purpose.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">3. Merchant Obligations</h2>
          <p className="mb-6">
            We strive to provide accurate product descriptions, pricing, and availability information. However, we do not warrant that product descriptions or other content are error-free, complete, or current. 
            We reserve the right to modify or discontinue any product at any time without notice.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">4. Ordering Process & Pricing</h2>
          <p className="mb-6">
            All prices displayed on this website are in <strong>United Arab Emirates Dirham (AED)</strong>. 
            We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies in product or pricing information, or problems identified by our fraud avoidance department.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">5. Payment</h2>
          <p className="mb-6">
            We accept Visa and Mastercard payments. All payments are processed securely. Your payment information is encrypted and transmitted securely to our payment processors (Checkout.com, Telr). 
            We do not store your full credit card details on our servers.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">6. Shipping, Returns & Refunds</h2>
          <p className="mb-6">
            Please refer to our <a href="/shipping" className="text-brand-text underline hover:text-brand-accent">Shipping Policy</a> and <a href="/refund" className="text-brand-text underline hover:text-brand-accent">Refund Policy</a> for detailed information on delivery times, costs, and our procedures for returns and cancellations.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">7. Intellectual Property</h2>
          <p className="mb-6">
            All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Boss General Trading LLC and is protected by international copyright laws.
          </p>

          <h2 className="text-xl font-medium text-brand-text mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="mb-6">
            Boss General Trading LLC shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our website or products.
          </p>
          
          <div className="mt-12 pt-8 border-t border-brand-border text-sm text-center">
            <p>Last Updated: July 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
