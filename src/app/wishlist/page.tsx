import { WishlistClientGrid } from "@/components/wishlist/WishlistClientGrid";

export const metadata = {
  title: "Wishlist | Boss Perfumes",
};

export default function WishlistPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32">
      <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-2">Your Wishlist</h1>
      <p className="text-brand-text-muted font-light mb-12">View and manage your saved items.</p>
      <WishlistClientGrid />
    </div>
  );
}
