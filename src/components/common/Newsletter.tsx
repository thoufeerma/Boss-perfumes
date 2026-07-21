"use client";

export function Newsletter() {
  return (
    <section className="bg-brand-bg py-8 md:py-12 px-6 lg:px-12 text-center border-t border-brand-border">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-text mb-6">
          Join The Inner Circle
        </h2>
        <p className="text-brand-text-muted text-lg mb-12">
          Subscribe to receive exclusive access to new releases, private sales, and the art of fine perfumery.
        </p>
        
        <form className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4 sm:gap-0" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your Email Address"
            required
            className="flex-1 bg-transparent border-b border-brand-text/30 pb-4 text-brand-text text-lg focus:outline-none focus:border-brand-text placeholder:text-brand-text-muted/60 transition-colors"
          />
          <button
            type="submit"
            className="sm:ml-8 text-sm font-medium tracking-widest uppercase text-brand-text hover:text-brand-accent transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-brand-text hover:after:bg-brand-accent self-start sm:self-auto pt-2 sm:pt-0"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
