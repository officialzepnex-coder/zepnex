'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const reasons = [
  {
    icon: 'ShieldCheckIcon',
    title: 'Verified Brand Partners',
    desc: 'Every brand on ZEPNEX is manually vetted for quality, authenticity, and customer service standards before listing.',
  },
  {
    icon: 'TruckIcon',
    title: 'Pan-India Delivery',
    desc: 'Fast, reliable delivery to 18,000+ pin codes across India. Free shipping on orders above ₹499.',
  },
  {
    icon: 'ArrowPathIcon',
    title: 'Hassle-Free Returns',
    desc: '7-day easy returns on all products. Our customer care team resolves every issue within 24 hours.',
  },
  {
    icon: 'CurrencyRupeeIcon',
    title: 'Best Price Guarantee',
    desc: 'Brands offer exclusive deals on ZEPNEX. If you find it cheaper elsewhere, we match the price.',
  },
];

export default function WhyZEPNEXSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-accent text-accent-foreground relative z-10 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(200,129,58,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="animate-on-scroll opacity-100">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">Why Choose Us</span>
            <h2 className="font-display text-section-lg text-white font-semibold mb-6">
              Built for Every<br />
              <span className="italic font-light text-primary">Kind of Shopper</span>
            </h2>
            <p className="text-white/60 font-light leading-relaxed mb-8 max-w-md">
              Whether you're hunting for the latest trends, stocking up on household essentials, or discovering a new favorite brand — ZEPNEX is designed for you.
            </p>
            <div className="flex flex-wrap gap-3">
              {['General Shoppers', 'Trend Hunters', 'Budget Families', 'Brand Loyalists'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 border border-white/20 text-white/70 text-xs font-medium rounded-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-on-scroll opacity-100">
            {reasons.map((r, i) => (
              <div
                key={r.title}
                className="p-5 border border-white/10 hover:border-primary/40 transition-colors group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 mb-4 flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-colors">
                  <Icon name={r.icon as Parameters<typeof Icon>[0]['name']} size={20} variant="outline" className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{r.title}</h3>
                <p className="text-xs text-white/50 font-light leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
