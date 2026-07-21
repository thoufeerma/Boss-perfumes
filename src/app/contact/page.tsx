import { MerchantInformation } from "@/components/common/MerchantInformation";

export const metadata = {
  title: "Contact Us | Boss Perfumes",
  description: "Contact Boss General Trading LLC for inquiries, support, and feedback.",
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg min-h-screen">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-text mb-6 text-center">Contact Us</h1>
        <p className="text-center text-brand-text-muted mb-16 max-w-2xl mx-auto">
          We would love to hear from you. Whether you have a question about our luxury perfumes, need assistance with your order, or simply want to share your feedback, our team is here to help.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Merchant Information Column */}
          <div>
            <h2 className="text-xl font-serif text-brand-text mb-8">Our Details</h2>
            <div className="bg-brand-surface border border-brand-border p-8">
              <MerchantInformation />
            </div>
          </div>

          {/* Contact Form Column */}
          <div>
            <h2 className="text-xl font-serif text-brand-text mb-8">Send us a Message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-text uppercase tracking-widest mb-2">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors text-brand-text"
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-text uppercase tracking-widest mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors text-brand-text"
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-brand-text uppercase tracking-widest mb-2">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors text-brand-text"
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-brand-text uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={5}
                  className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors text-brand-text resize-none"
                  required 
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-brand-text text-white py-4 text-sm font-medium tracking-widest uppercase hover:bg-brand-accent transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
