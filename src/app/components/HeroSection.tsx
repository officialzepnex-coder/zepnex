'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCatalog } from '@/lib/catalog';

export default function HeroSection() {
  const { homepage } = useCatalog();
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrollY = window.scrollY;
      const bg = el.querySelector('.hero-bg') as HTMLElement;
      if (bg) {
        bg.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="hero-bg absolute inset-0 z-0 will-change-transform">
        <AppImage
          src={homepage.image}
          alt="Bright airy marketplace shopping hall with warm natural light streaming through large windows, light stone floors, well-lit open space"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw" />

        {/* Scrim for white text */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-background/90" />
      </div>

      {/* Decorative blob */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 blob-warm pointer-events-none z-0 opacity-60" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-20">
        <span
          className="inline-block mb-5 text-xs font-semibold tracking-[0.35em] uppercase text-white/80 opacity-0"
          style={{ animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s forwards' }}>

          {homepage.eyebrow}
        </span>

        <h1
          className="font-display text-hero-xl text-white font-semibold leading-tight mb-6 opacity-0"
          style={{ animation: 'animationIn 1.1s cubic-bezier(0.16,1,0.3,1) 0.35s forwards' }}>

          {homepage.title}<br />
          <span className="italic font-light text-primary" style={{ filter: 'drop-shadow(0 2px 12px rgba(200,129,58,0.5))' }}>
            {homepage.highlight}
          </span>
        </h1>

        <p
          className="max-w-2xl mx-auto text-white/75 text-base sm:text-lg font-light leading-relaxed mb-10 opacity-0"
          style={{ animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.55s forwards' }}>

          {homepage.subtitle}
        </p>

        {/* Search Bar */}
        <div
          className="max-w-2xl mx-auto mb-8 opacity-0"
          style={{ animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.7s forwards' }}>

          <div className="flex items-stretch rounded-sm overflow-hidden border-2 border-white/20 search-bar-glow bg-white/10 backdrop-blur-md">
            <input
              type="text"
              placeholder="Search brands, products, categories..."
              className="flex-1 px-5 py-3.5 bg-transparent text-white placeholder:text-white/50 text-sm focus:outline-none min-w-0" />

            <button className="px-6 py-3.5 bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 flex-shrink-0">
              <Icon name="MagnifyingGlassIcon" size={16} variant="outline" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center items-center opacity-0"
          style={{ animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.85s forwards' }}>

          <Link
            href="/products"
            className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity rounded-sm flex items-center gap-2 min-h-[44px]">

            <Icon name="ShoppingBagIcon" size={16} variant="outline" />
            {homepage.ctaPrimary}
          </Link>
          <Link
            href="/brands"
            className="px-8 py-3.5 border-2 border-white/40 text-white font-medium text-sm uppercase tracking-wider hover:border-white hover:bg-white/10 transition-all rounded-sm flex items-center gap-2 min-h-[44px] backdrop-blur-sm">

            <Icon name="BuildingStorefrontIcon" size={16} variant="outline" />
            {homepage.ctaSecondary}
          </Link>
        </div>

        {/* Trust bar */}
        <div
          className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-10 opacity-0"
          style={{ animation: 'fadeIn 1s ease 1.1s forwards' }}>

          {[
          { icon: 'StarIcon', label: '4.8★ Rated' },
          { icon: 'TruckIcon', label: 'Pan-India Delivery' }].
          map((item) =>
          <div key={item.label} className="flex items-center gap-2 text-white/70 text-xs font-medium">
              <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={14} variant="outline" className="text-primary" />
              {item.label}
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 opacity-0" style={{ animation: 'fadeIn 1s ease 1.4s forwards' }}>
        <div className="w-px h-16 bg-gradient-to-b from-primary to-transparent mx-auto" />
      </div>
    </section>);

}