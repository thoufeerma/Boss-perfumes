import { Metadata } from "next";
import { HorizontalGallery } from "@/components/boutique/HorizontalGallery";

export const metadata: Metadata = {
  title: "Our Store | Boss Perfumes",
  description: "Experience the elegance of Boss Perfumes. Step into our curated store and discover a world of luxury and signature fragrances.",
};

export default function OurBoutiquePage() {
  return (
    <main className="bg-brand-surface">
      <HorizontalGallery />
      
      <section className="py-24 px-6 lg:px-12 bg-brand-surface">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left: Address Info */}
          <div className="w-full md:w-1/2 flex flex-col text-left">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-brand-text mb-6">
              Visit Us Today
            </h2>
            <p className="text-base md:text-lg text-brand-text-muted mb-12 font-light leading-relaxed max-w-md">
              Discover your signature scent in person. Our fragrance experts are ready to guide you through our exclusive collections.
            </p>
            
            <div className="space-y-3 text-sm md:text-base text-brand-text font-light tracking-wide">
              <p>Shop No: 11 & 12, Al Zarouni Building</p>
              <p>Near Kuwait Mosque, Al Dhagaya Street</p>
              <p>Deira, Dubai, United Arab Emirates</p>
              <p className="text-brand-text-muted pt-2">P.O. Box: 81130</p>
            </div>
          </div>

          {/* Right: Map */}
          <div className="w-full md:w-1/2 rounded-[24px] overflow-hidden shadow-2xl bg-gray-100/50 min-h-[400px] md:min-h-[500px] flex">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.9625681677812!2d55.30117320000001!3d25.271844599999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5cbc0000002f%3A0xa5b5c5cb81e6772e!2sBOSS%20GENERAL%20TRADING%20(L.L.C)!5e0!3m2!1sen!2sin!4v1785224476220!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '400px', flexGrow: 1 }} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>

        </div>
      </section>
    </main>
  );
}
