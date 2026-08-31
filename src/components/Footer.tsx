'use client';
import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Brands', href: '/brands' },
  { label: 'Products', href: '/products' },
  { label: 'Team', href: '/team' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];

const socialLinks = [
  { icon: 'GlobeAltIcon', label: 'Website', href: '#' },
  { icon: 'ChatBubbleLeftEllipsisIcon', label: 'Twitter', href: '#' },
  { icon: 'PhotoIcon', label: 'Instagram', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Arc Browser Split Pattern */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Left — Logo + tagline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <AppLogo size={32} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
              <span className="font-display text-lg font-semibold text-foreground tracking-tight">ZEPNEX</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              India's premium multi-brand marketplace for everyday shoppers and growing brands.
            </p>
          </div>

          {/* Right — Links */}
          <div className="flex flex-col sm:items-end gap-4">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={18} variant="outline" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ZEPNEX. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="PhoneIcon" size={12} variant="outline" />
            <a href="tel:7073415826" className="text-foreground font-medium hover:text-primary transition-colors">
              7073415826
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}