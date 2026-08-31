'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

export default function BrandHero() {
  const [following, setFollowing] = useState(false);

  return (
    <section className="relative pt-16 sm:pt-20">
      {/* Cover Banner — placeholder */}
      <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Icon name="PhotoIcon" size={40} variant="outline" className="text-muted-foreground/40" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Brand Cover Image</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 sm:left-6 flex items-center gap-2 text-foreground/60 text-xs">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Icon name="ChevronRightIcon" size={12} variant="outline" />
          <span className="text-foreground">Brand Page</span>
        </div>
      </div>

      {/* Brand Identity Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end -mt-10 sm:-mt-12 relative z-10">
          {/* Brand Logo placeholder */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm border-4 border-background bg-card shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
            <AppLogo size={56} />
          </div>

          {/* Brand Info placeholder */}
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">Your Brand Name</h1>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1">
                <Icon name="CheckBadgeIcon" size={12} variant="solid" />
                Pending Verification
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Brand tagline will appear here once you join</p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Icon name="StarIcon" size={12} variant="outline" />
                No reviews yet
              </span>
              <span className="flex items-center gap-1">
                <Icon name="ShoppingBagIcon" size={12} variant="outline" />
                0 Products
              </span>
              <span className="flex items-center gap-1">
                <Icon name="UserGroupIcon" size={12} variant="outline" />
                0 Followers
              </span>
              <span className="flex items-center gap-1">
                <Icon name="MapPinIcon" size={12} variant="outline" />
                Location, India
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => setFollowing(!following)}
              className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all min-h-[44px] flex items-center gap-1.5 ${
                following
                  ? 'bg-muted text-muted-foreground border border-border'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}>
              <Icon name={following ? 'CheckIcon' : 'PlusIcon'} size={14} variant="outline" />
              {following ? 'Following' : 'Follow'}
            </button>
            <Link
              href="#contact-brand"
              className="px-5 py-2.5 border border-border text-foreground text-xs font-medium uppercase tracking-wider hover:border-foreground transition-colors rounded-sm min-h-[44px] flex items-center gap-1.5">
              <Icon name="ChatBubbleLeftEllipsisIcon" size={14} variant="outline" />
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}