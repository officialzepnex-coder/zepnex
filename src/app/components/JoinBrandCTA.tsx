'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const benefits = [
{ icon: 'ChartBarIcon', text: 'Access to 1.2M+ active shoppers' },
{ icon: 'CameraIcon', text: 'Free brand page setup & management' },
{ icon: 'BanknotesIcon', text: 'Lowest marketplace commission (8%)' },
{ icon: 'ChartPieIcon', text: 'Real-time sales analytics dashboard' }];


export default function JoinBrandCTA() {
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
    <section ref={sectionRef} className="py-16 sm:py-20 bg-secondary/40 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative border border-border bg-card overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <AppImage
              src="https://images.unsplash.com/photo-1611154376393-dc7c3f518fc8"
              alt="Abstract retail store background pattern, very light and desaturated"
              fill
              className="object-cover"
              sizes="100vw" />

          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-12 lg:p-16 items-center">
            {/* Left */}
            <div className="animate-on-scroll opacity-100">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">For Brands</span>
              <h2 className="font-display text-section-lg text-foreground font-semibold mb-5">
                Grow Your Brand<br />
                <span className="italic font-light text-primary">on ZEPNEX</span>
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed mb-8 max-w-md">
                Join 200+ brands already selling on India's most trusted multi-brand marketplace. Set up your brand page, upload products, and start reaching millions of shoppers today.
              </p>
              <ul className="space-y-3 mb-8">
                {benefits.map((b) =>
                <li key={b.text} className="flex items-center gap-3">
                    <div className="w-7 h-7 flex-shrink-0 bg-primary/10 flex items-center justify-center rounded-sm">
                      <Icon name={b.icon as Parameters<typeof Icon>[0]['name']} size={14} variant="outline" className="text-primary" />
                    </div>
                    <span className="text-sm text-foreground font-medium">{b.text}</span>
                  </li>
                )}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/brand-page"
                  className="px-7 py-3.5 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity rounded-sm flex items-center justify-center gap-2 min-h-[44px]">

                  <Icon name="BuildingStorefrontIcon" size={16} variant="outline" />
                  Start Selling Free
                </Link>
                <Link
                  href="/brand-page"
                  className="px-7 py-3.5 border border-border text-foreground font-medium text-sm hover:border-foreground transition-colors rounded-sm flex items-center justify-center gap-2 min-h-[44px]">

                  View Brand Demo
                  <Icon name="ArrowRightIcon" size={14} variant="outline" />
                </Link>
              </div>
            </div>

            {/* Right — Stats card */}
            <div className="hidden lg:flex flex-col gap-4 animate-on-scroll opacity-100">
              <div className="grid grid-cols-2 gap-4">
                {[
                { val: '₹0', label: 'Setup Cost', sub: 'Completely free to join' },
                { val: '8%', label: 'Commission', sub: 'Industry lowest' },
                { val: '48hr', label: 'Go Live', sub: 'From application to launch' },
                { val: '24/7', label: 'Support', sub: 'Dedicated brand manager' }].
                map((s) =>
                <div key={s.label} className="p-5 bg-secondary/60 border border-border">
                    <div className="font-display text-2xl font-semibold text-primary mb-1">{s.val}</div>
                    <div className="text-sm font-semibold text-foreground mb-0.5">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.sub}</div>
                  </div>
                )}
              </div>
              <div className="p-5 bg-accent/5 border border-primary/20 flex items-center gap-4">
                <Icon name="PhoneIcon" size={20} variant="outline" className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Talk to our Brand Team</p>
                  <a href="tel:+918001234567" className="text-base font-semibold text-foreground hover:text-primary transition-colors">
                    +91 800 123 4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}