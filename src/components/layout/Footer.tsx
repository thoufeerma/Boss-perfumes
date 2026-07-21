import Link from "next/link";
import Image from "next/image";
import { MerchantInformation } from "@/components/common/MerchantInformation";

export function Footer() {
  return (
    <footer className="bg-brand-bg-secondary pt-24 pb-12 px-6 lg:px-12 border-t border-brand-border">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-24">
        {/* Brand & Newsletter col */}
        <div className="md:col-span-4">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-text mb-6">
            Friends let friends know about best products and content.
          </p>
          <form className="flex border-b border-brand-border pb-2 group mb-8">
            <input 
              type="email" 
              placeholder="Enter email address..." 
              className="bg-transparent flex-1 focus:outline-none placeholder:text-brand-text-muted text-brand-text"
            />
            <button type="submit" className="p-2 text-brand-text group-hover:text-brand-accent transition-colors">
              <span className="sr-only">Subscribe</span>
              →
            </button>
          </form>
          <div className="mt-12">
            <Link href="/" className="inline-block">
              <Image
                src="/black logo.png"
                alt="Boss Perfumes"
                width={140}
                height={48}
                className="h-10 md:h-14 w-auto object-contain"
                style={{ width: "auto" }}
              />
            </Link>
          </div>
        </div>

        {/* Links Col 1 */}
        <div className="md:col-span-2">
          <h4 className="text-sm font-medium uppercase tracking-widest text-brand-text mb-6">Shop</h4>
          <ul className="flex flex-col gap-4">
            <li><Link href="/collections" className="text-brand-text-muted hover:text-brand-text transition-colors">All Perfumes</Link></li>
            <li><Link href="/category/men" className="text-brand-text-muted hover:text-brand-text transition-colors">Men's</Link></li>
            <li><Link href="/category/women" className="text-brand-text-muted hover:text-brand-text transition-colors">Women's</Link></li>
            <li><Link href="/category/unisex" className="text-brand-text-muted hover:text-brand-text transition-colors">Unisex</Link></li>
          </ul>
        </div>

        {/* Links Col 2 */}
        <div className="md:col-span-2">
          <h4 className="text-sm font-medium uppercase tracking-widest text-brand-text mb-6">Support</h4>
          <ul className="flex flex-col gap-4">
            <li><Link href="/terms" className="text-brand-text-muted hover:text-brand-text transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="text-brand-text-muted hover:text-brand-text transition-colors">Privacy Policy</Link></li>
            <li><Link href="/refund" className="text-brand-text-muted hover:text-brand-text transition-colors">Refund Policy</Link></li>
            <li><Link href="/shipping" className="text-brand-text-muted hover:text-brand-text transition-colors">Shipping Policy</Link></li>
            <li><Link href="/contact" className="text-brand-text-muted hover:text-brand-text transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Merchant Info Col */}
        <div className="md:col-span-4">
          <MerchantInformation />
        </div>
      </div>

      <div className="mx-auto max-w-7xl flex flex-col items-center">
        
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-brand-border">
          <p className="text-brand-text-muted text-sm">
            © 2026 Boss General Trading LLC. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 text-brand-text-muted">
            <a href="#" className="hover:text-brand-text transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="hover:text-brand-text transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="hover:text-brand-text transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
