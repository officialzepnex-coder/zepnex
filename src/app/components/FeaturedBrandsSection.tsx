'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { brands } from '@/data/brands';

export default function FeaturedBrandsSection() {
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
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    );
    const els = sectionRef?.current?.querySelectorAll('.animate-on-scroll');
    els?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 sm:mb-14">
          <div className="animate-on-scroll opacity-100" style={{ animation: 'none' }}>
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-2 block">Our Partners</span>
            <h2 className="font-display text-section-lg text-foreground font-semibold">
              Featured <span className="italic font-light">Brands</span>
            </h2>
          </div>
          <Link
            href="/brands"
            className="text-sm font-medium text-primary border-b border-primary pb-0.5 hover:opacity-70 transition-opacity flex items-center gap-1.5 animate-on-scroll opacity-100">
            View All Brands
            <Icon name="ArrowRightIcon" size={14} variant="outline" />
          </Link>
        </div>

        {/* Featured Brand Cards */}
        <div className="animate-on-scroll opacity-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {brands.slice(0, 6).map((brand, idx) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="group animate-on-scroll opacity-100"
                style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="bg-card rounded-sm overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  {/* Brand Cover */}
                  <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                    <img
                      src={brand.coverImage}
                      alt={brand.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Brand Logo & Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-12 h-12 rounded-full border-2 border-background flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                          {brand.name}
                        </h3>
                        {brand.verified && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <Icon name="CheckBadgeIcon" size={12} variant="solid" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {brand.tagline}
                    </p>

                    {/* Stats */}
                    <div className="space-y-1.5 text-xs text-muted-foreground mb-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon name="StarIcon" size={12} variant="outline" />
                        <span>{brand.rating} ({brand.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="ShoppingBagIcon" size={12} variant="outline" />
                        <span>{brand.productCount} Products</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="UserGroupIcon" size={12} variant="outline" />
                        <span>{brand.followers.toLocaleString()} Followers</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="w-full px-3 py-2 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                      View Store
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}