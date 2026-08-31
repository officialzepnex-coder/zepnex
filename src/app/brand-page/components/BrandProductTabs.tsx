'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const tabs = ['All Products', 'Clothes', 'Daily Use', 'Accessories'];

export default function BrandProductTabs() {
  const [activeTab, setActiveTab] = useState('All Products');

  return (
    <section className="py-12 sm:py-20 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
            Our <span className="italic font-light">Products</span>
          </h2>
          <Link href="/products" className="text-sm font-medium text-primary border-b border-primary pb-0.5 hover:opacity-70 transition-opacity flex items-center gap-1.5">
            View in Full Catalog
            <Icon name="ArrowRightIcon" size={14} variant="outline" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs?.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`category-pill flex-shrink-0 min-h-[44px] ${activeTab === tab ? 'active' : ''}`}>
              {tab}
              <span className="ml-1.5 text-[10px] opacity-60">(0)</span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="border-2 border-dashed border-border rounded-sm bg-background py-16 px-6 flex flex-col items-center justify-center text-center mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon name="ShoppingBagIcon" size={28} variant="outline" className="text-primary" />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
            No Products Added Yet
          </h3>
          <p className="text-muted-foreground text-sm font-light max-w-sm mb-6 leading-relaxed">
            Once this brand joins BrandMart and lists their products, they will appear here across all categories.
          </p>
          <Link
            href="#join"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity min-h-[44px]">
            <Icon name="PlusIcon" size={14} variant="outline" />
            Add Products
          </Link>
        </div>

        {/* Placeholder product slots */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4]?.map((i) => (
            <div key={i} className="bg-card border border-dashed border-border overflow-hidden rounded-sm">
              <div className="aspect-square bg-muted flex items-center justify-center">
                <Icon name="PhotoIcon" size={24} variant="outline" className="text-muted-foreground/30" />
              </div>
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-2.5 bg-muted rounded-full w-3/4" />
                <div className="h-2 bg-muted rounded-full w-1/2" />
                <div className="h-2 bg-muted rounded-full w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}