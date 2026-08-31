'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

export default function BrandContact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact-brand" className="py-12 sm:py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* Left */}
          <div>
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">Get In Touch</span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-5 leading-tight">
              Contact <span className="italic font-light">ThreadCraft</span>
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed mb-8 text-sm sm:text-base">
              Have questions about a product, bulk orders, or custom designs? Our team typically responds within 2 hours on business days.
            </p>

            <div className="space-y-5">
              {[
                { icon: 'PhoneIcon', label: 'Phone / WhatsApp', value: '+91 98765 43210', href: 'tel:+919876543210' },
                { icon: 'EnvelopeIcon', label: 'Email', value: 'hello@threadcraft.in', href: 'mailto:hello@threadcraft.in' },
                { icon: 'MapPinIcon', label: 'Location', value: 'Bapu Bazaar, Jaipur, Rajasthan 302001', href: '#' },
                { icon: 'ClockIcon', label: 'Business Hours', value: 'Mon–Sat: 10:00 AM – 7:00 PM', href: '#' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 border border-border flex items-center justify-center bg-card">
                    <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={16} variant="outline" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                    <a href={item.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{item.value}</a>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Number */}
            <div className="mt-8 p-5 bg-primary/8 border border-primary/20 flex items-center gap-4">
              <Icon name="PhoneIcon" size={20} variant="outline" className="text-primary flex-shrink-0" />
              <div>
                <a href="tel:7073415826" className="text-base font-semibold text-foreground hover:text-primary transition-colors">
                  7073415826
                </a>
                <p className="text-xs text-muted-foreground">Available 24/7 for order support</p>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-card border border-border p-6 sm:p-8">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Icon name="CheckIcon" size={28} variant="outline" className="text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                <p className="text-sm text-muted-foreground max-w-xs">ThreadCraft will respond within 2 hours. Check your email for confirmation.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-primary border-b border-primary pb-0.5 hover:opacity-70 transition-opacity">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground resize-none"
                    placeholder="Ask about products, bulk orders, custom designs..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity rounded-sm min-h-[44px] flex items-center justify-center gap-2"
                >
                  <Icon name="PaperAirplaneIcon" size={16} variant="outline" />
                  Send Message to Brand
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}