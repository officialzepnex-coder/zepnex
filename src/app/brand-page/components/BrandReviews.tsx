'use client';
import React from 'react';

import Icon from '@/components/ui/AppIcon';

export default function BrandReviews() {
  return (
    <section className="py-12 sm:py-20 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-1">
              Customer <span className="italic font-light">Reviews</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5]?.map((s) => (
                  <Icon key={s} name="StarIcon" size={14} variant="outline" className="text-muted-foreground" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">No reviews yet</span>
            </div>
          </div>
          {/* Rating Breakdown placeholder */}
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            {[5, 4, 3, 2, 1]?.map((stars) => (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground w-3">{stars}</span>
                <Icon name="StarIcon" size={10} variant="outline" className="text-muted-foreground" />
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-muted rounded-full" style={{ width: '0%' }} />
                </div>
                <span className="text-muted-foreground w-6 text-right">0%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="border-2 border-dashed border-border rounded-sm bg-secondary/10 py-14 px-6 flex flex-col items-center justify-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon name="ChatBubbleLeftRightIcon" size={28} variant="outline" className="text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No Reviews Yet
          </h3>
          <p className="text-muted-foreground text-sm font-light max-w-sm leading-relaxed">
            Customer reviews will appear here after shoppers purchase from this brand.
          </p>
        </div>

        {/* Placeholder review card slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3]?.map((i) => (
            <div key={i} className="bg-card border border-dashed border-border p-5 sm:p-6 rounded-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-muted rounded-full w-20" />
                    <div className="h-2 bg-muted rounded-full w-14" />
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5]?.map((s) => (
                    <div key={s} className="w-2.5 h-2.5 rounded-sm bg-muted" />
                  ))}
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-2.5 bg-muted rounded-full w-full" />
                <div className="h-2.5 bg-muted rounded-full w-5/6" />
                <div className="h-2.5 bg-muted rounded-full w-4/6" />
              </div>
              <div className="h-2 bg-muted rounded-full w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}