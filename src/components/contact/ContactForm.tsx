"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ContactForm() {
  const t = useT();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate submission or invoke API endpoint if configured
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
      toast.success(t.contact.success);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-brand-text mb-8">{t.contact.sendMessage}</h2>

      {isSubmitted ? (
        <div className="bg-brand-surface border border-brand-border p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
            ✓
          </div>
          <p className="font-serif text-lg text-brand-text">{t.contact.success}</p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="text-xs tracking-widest uppercase text-brand-text-muted hover:text-brand-text underline underline-offset-4"
          >
            {t.contact.sendMessage}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-text uppercase tracking-widest mb-2">
              {t.contact.name}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.contact.namePlaceholder}
              className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors text-brand-text"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-text uppercase tracking-widest mb-2">
              {t.contact.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t.contact.emailPlaceholder}
              className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors text-brand-text"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-brand-text uppercase tracking-widest mb-2">
              {t.contact.subject}
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder={t.contact.subjectPlaceholder}
              className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors text-brand-text"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-brand-text uppercase tracking-widest mb-2">
              {t.contact.message}
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={t.contact.messagePlaceholder}
              className="w-full bg-brand-surface border border-brand-border p-4 focus:outline-none focus:border-brand-text transition-colors text-brand-text resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-text text-white py-4 text-sm font-medium tracking-widest uppercase hover:bg-brand-accent transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? t.contact.submitting : t.contact.submit}
          </button>
        </form>
      )}
    </div>
  );
}
