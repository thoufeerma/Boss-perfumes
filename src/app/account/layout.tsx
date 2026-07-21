import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";
import { requireAuthenticatedCustomer } from "@/lib/authGuard";

export const metadata = {
  title: "My Account | Boss Perfumes",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await requireAuthenticatedCustomer();

  const displayName = customer.first_name 
    ? `${customer.first_name} ${customer.last_name}`.trim() 
    : customer.username || "User";
    
  const displayEmail = customer.email;

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg-secondary min-h-screen">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-12 text-center">My Account</h1>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="mb-8">
              <h2 className="text-xl font-serif text-brand-text mb-1">Hello, {displayName}</h2>
              <p className="text-xs tracking-widest uppercase text-brand-text-muted">{displayEmail}</p>
            </div>
            <ul className="space-y-6">
              <li>
                <Link href="/account" className="text-sm font-medium tracking-widest uppercase text-brand-text-muted hover:text-brand-text transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-sm font-medium tracking-widest uppercase text-brand-text-muted hover:text-brand-text transition-colors">
                  Orders
                </Link>
              </li>

              <li>
                <Link href="/account/addresses" className="text-sm font-medium tracking-widest uppercase text-brand-text-muted hover:text-brand-text transition-colors">
                  Addresses
                </Link>
              </li>
              <li>
                <Link href="/account/details" className="text-sm font-medium tracking-widest uppercase text-brand-text-muted hover:text-brand-text transition-colors">
                  Account Details
                </Link>
              </li>
              <li>
                <LogoutButton className="text-sm font-medium tracking-widest uppercase text-brand-text-muted hover:text-brand-text transition-colors mt-8 inline-block" />
              </li>
            </ul>
          </aside>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
