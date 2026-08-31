'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

export default function BrandAbout() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('animate'); observer.unobserve(e.target); }
        });
      },
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.animate-on-scroll')?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 sm:py-20 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left — image placeholder */}
          <div className="relative animate-on-scroll opacity-100">
            <div className="aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center rounded-sm border border-dashed border-border">
              <div className="flex flex-col items-center gap-3 text-center p-8">
                <Icon name="PhotoIcon" size={40} variant="outline" className="text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Brand Story Image</span>
              </div>
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-card border border-border shadow-lg p-4 sm:p-5">
              <div className="font-display text-2xl font-semibold text-primary mb-0.5">—</div>
              <div className="text-xs text-muted-foreground font-medium">Years of Excellence</div>
            </div>
          </div>

          {/* Right Content */}
          <div className="animate-on-scroll opacity-100 pt-4 lg:pt-0">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">Our Story</span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-5 leading-tight">
              Your Brand Story<br />
              <span className="italic font-light">Goes Here</span>
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed mb-5 text-sm sm:text-base">
              Once your brand joins BrandMart, your story, mission, and values will be showcased here. Tell your customers who you are, where you come from, and what makes your products special.
            </p>
            <p className="text-muted-foreground font-light leading-relaxed mb-8 text-sm sm:text-base">
              Share your journey, your craft, and your commitment to quality. This section helps shoppers connect with your brand on a deeper level.
            </p>

            {/* Milestones placeholders */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
              {[
                { icon: 'CalendarIcon', label: 'Founded', value: '—' },
                { icon: 'MapPinIcon', label: 'Origin', value: '—' },
                { icon: 'ShoppingBagIcon', label: 'Products', value: '0' },
                { icon: 'TruckIcon', label: 'Delivered', value: '0' },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <Icon name={m.icon as Parameters<typeof Icon>[0]['name']} size={18} variant="outline" className="text-primary mx-auto mb-2" />
                  <div className="font-display text-lg font-semibold text-foreground">{m.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}