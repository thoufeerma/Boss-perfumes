import Image from "next/image";

const POSTS = [
  "/images/campaign-hero.png",
  "/images/product-placeholder.png",
  "/images/campaign-hero.png",
  "/images/product-placeholder.png",
];

export function InstagramGallery() {
  return (
    <section className="bg-brand-surface py-8 md:py-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 mb-8 text-center">
        <h2 className="text-3xl md:text-5xl font-serif text-brand-text mb-6">@BossPerfumes</h2>
        <p className="text-brand-text-muted max-w-2xl mx-auto">
          Join our community. Tag us to be featured in our gallery.
        </p>
      </div>

      <div className="flex flex-col md:flex-row w-full h-[50vh] md:h-[60vh]">
        {POSTS.map((src, index) => (
          <a
            key={index}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full md:w-1/4 h-full overflow-hidden block"
          >
            <Image
              src={src}
              alt={`Instagram post ${index + 1}`}
              fill
              className="object-cover object-center group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
