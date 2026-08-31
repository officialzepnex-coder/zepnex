'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { brands } from '@/data/brands';

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'new'>('all');

  const filteredBrands = useMemo(() => {
    let result = [...brands];

    // Filter by search
    if (searchQuery) {
      result = result.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tagline.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by verification status
    if (selectedFilter === 'verified') {
      result = result.filter(b => b.verified);
    } else if (selectedFilter === 'new') {
      result = result.filter(b => !b.verified);
    }

    return result;
  }, [searchQuery, selectedFilter]);

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      <div className="pt-16 sm:pt-20 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-secondary/30 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Icon name="ChevronRightIcon" size={12} variant="outline" />
              <span className="text-foreground">All Brands</span>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-gradient-to-b from-primary/10 to-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Discover Our <span className="text-primary">Partner Brands</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore curated brands offering quality products from fashion to electronics and everything in between.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative flex items-center border border-border rounded-sm overflow-hidden bg-card search-bar-glow">
                <Icon name="MagnifyingGlassIcon" size={18} variant="outline" className="text-muted-foreground ml-4" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-3 text-muted-foreground hover:text-foreground">
                    <Icon name="XMarkIcon" size={18} variant="outline" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Filters */}
          <div className="flex gap-3 mb-8 flex-wrap">
            {(['all', 'verified', 'new'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all ${
                  selectedFilter === filter
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:border-primary'
                }`}>
                {filter === 'all' ? 'All Brands' : filter === 'verified' ? 'Verified' : 'New'}
              </button>
            ))}
            <div className="ml-auto text-xs text-muted-foreground py-2">
              {filteredBrands.length} results
            </div>
          </div>

          {/* Brands Grid */}
          {filteredBrands.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.id}`}
                  className="group">
                  <div className="bg-card rounded-sm overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    {/* Brand Cover */}
                    <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                      <img
                        src={brand.coverImage}
                        alt={brand.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Brand Logo & Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-16 h-16 rounded-full border-4 border-background flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors mb-1">
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

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {brand.tagline}
                      </p>

                      {/* Stats */}
                      <div className="space-y-2 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Icon name="StarIcon" size={12} variant="solid" className="text-primary" />
                            Rating
                          </span>
                          <span className="font-semibold text-foreground">{brand.rating}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Icon name="ShoppingBagIcon" size={12} variant="outline" />
                            Products
                          </span>
                          <span className="font-semibold text-foreground">{brand.productCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Icon name="UserGroupIcon" size={12} variant="outline" />
                            Followers
                          </span>
                          <span className="font-semibold text-foreground">{brand.followers.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <button className="w-full px-3 py-2.5 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                        View Store
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Icon name="BuildingStorefrontIcon" size={48} variant="outline" className="text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Brands Found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-sm hover:border-foreground transition-colors">
                Reset Filters
              </button>
            </div>
          )}

          {/* Join as Brand CTA */}
          <div className="mt-16 pt-12 border-t border-border text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Want to Join <span className="text-primary">BrandMart</span>?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of brands already selling on BrandMart. Reach new customers, grow your business, and build your brand.
            </p>
            <Link
              href="/brand-page"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity">
              <Icon name="PlusIcon" size={16} variant="outline" />
              Join as a Brand
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
