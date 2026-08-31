'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

export default function TestimonialsSection() {
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
    const els = sectionRef?.current?.querySelectorAll('.animate-on-scroll');
    els?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-background border-y border-border relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14 animate-on-scroll opacity-100">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-3 block">Shopper Stories</span>
          <h2 className="font-display text-section-lg text-foreground font-semibold">
            Real People, <span className="italic font-light">Real Savings</span>
          </h2>
        </div>

        {/* Empty State */}
        <div className="animate-on-scroll opacity-100">
          <div className="border-2 border-dashed border-border rounded-sm bg-secondary/10 py-16 px-6 flex flex-col items-center justify-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon name="ChatBubbleLeftRightIcon" size={28} variant="outline" className="text-primary" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
              No Reviews Yet
            </h3>
            <p className="text-muted-foreground text-sm font-light max-w-sm leading-relaxed">
              Customer reviews will appear here once shoppers start purchasing from brands on ZEPNEX.
            </p>
          </div>

          {/* Placeholder review card slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3]?.map((i) => (
              <div
                key={i}
                className="bg-card border border-dashed border-border p-6 sm:p-7 rounded-sm animate-on-scroll opacity-100"
                style={{ animationDelay: `${i * 120}ms` }}>
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5]?.map((s) => (
                    <div key={s} className="w-3.5 h-3.5 rounded-sm bg-muted" />
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-2.5 bg-muted rounded-full w-full" />
                  <div className="h-2.5 bg-muted rounded-full w-5/6" />
                  <div className="h-2.5 bg-muted rounded-full w-4/6" />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2.5 bg-muted rounded-full w-1/2" />
                    <div className="h-2 bg-muted rounded-full w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}