'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Brands', href: '/brands' },
  { label: 'Products', href: '/products' },
  { label: 'Team', href: '/team' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-card/95 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 z-50">
            <AppLogo size={36} />
            <span className="font-display text-lg sm:text-xl tracking-tight text-foreground hidden sm:block font-semibold">
              ZEPNEX
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full search-bar-glow rounded-sm border border-border bg-card flex items-center transition-all">
              <input
                type="text"
                placeholder="Search brands, products, categories..."
                className="w-full px-4 py-2.5 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button className="px-4 py-2.5 bg-primary text-primary-foreground rounded-r-sm hover:opacity-90 transition-opacity flex items-center gap-1.5">
                <Icon name="MagnifyingGlassIcon" size={16} variant="outline" />
                <span className="text-xs font-medium hidden lg:block">Search</span>
              </button>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks?.map((link) => (
              <Link key={link?.href} href={link?.href} className="nav-link">
                {link?.label}
              </Link>
            ))}
            <Link
              href="/brand-page"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity rounded-sm"
            >
              <Icon name="PlusIcon" size={14} variant="outline" />
              Join as Brand
            </Link>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Link href="/cart" className="flex items-center">
                <Icon name="ShoppingBagIcon" size={22} variant="outline" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
              </Link>
            </button>
          </nav>

          {/* Mobile Icons */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle search"
            >
              <Icon name="MagnifyingGlassIcon" size={20} variant="outline" />
            </button>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Link href="/cart" className="flex items-center">
                <Icon name="ShoppingBagIcon" size={20} variant="outline" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center">3</span>
              </Link>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-foreground z-50"
              aria-label="Toggle menu"
            >
              {menuOpen
                ? <Icon name="XMarkIcon" size={22} variant="outline" />
                : <Icon name="Bars3Icon" size={22} variant="outline" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3 bg-card/95 backdrop-blur-md border-b border-border">
            <div className="flex items-center border border-border rounded-sm overflow-hidden search-bar-glow">
              <input
                type="text"
                placeholder="Search brands, products..."
                className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <button className="px-3 py-2.5 bg-primary text-primary-foreground">
                <Icon name="MagnifyingGlassIcon" size={16} variant="outline" />
              </button>
            </div>
          </div>
        )}
      </header>
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md flex flex-col pt-20 px-6"
          onClick={() => setMenuOpen(false)}
        >
          <nav className="flex flex-col gap-1 mt-4" onClick={(e) => e?.stopPropagation()}>
            {navLinks?.map((link) => (
              <Link
                key={link?.href}
                href={link?.href}
                className="py-4 text-lg font-medium text-foreground border-b border-border hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link?.label}
              </Link>
            ))}
            <div className="mt-6">
              <Link
                href="/brand-page"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="PlusIcon" size={16} variant="outline" />
                Join ZEPNEX as a Brand
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}