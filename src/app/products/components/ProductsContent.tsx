'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { products } from '@/data/products';
import { brands } from '@/data/brands';

const categories = ['All', 'Clothing', 'Daily Use', 'Electronics', 'Home & Living', 'Beauty', 'Sports'];
const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Highest Rated', 'Most Reviews'];

type PriceRange = { min: number; max: number };

export default function ProductsContent() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Relevance');
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 5000 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Price filter
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Sort
    switch (selectedSort) {
      case 'Price: Low to High':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Highest Rated':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'Most Reviews':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      // Relevance is default (no change)
    }

    return result;
  }, [selectedCategory, selectedSort, priceRange]);

  return (
    <div className="pt-16 sm:pt-20 min-h-screen">
      {/* Breadcrumb + Header */}
      <div className="bg-secondary/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Icon name="ChevronRightIcon" size={12} variant="outline" />
            <span className="text-foreground">All Products</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground">All Products</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{filteredProducts.length} results found</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground hidden sm:block">Sort:</label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="text-sm border border-border bg-card text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors appearance-none rounded-sm min-h-[44px] pr-8"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%237A7060' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '16px',
                  }}>
                  {sortOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sm:hidden flex items-center gap-2 px-4 py-2.5 border border-border bg-card text-foreground text-sm font-medium rounded-sm min-h-[44px]">
                <Icon name="FunnelIcon" size={16} variant="outline" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill flex-shrink-0 min-h-[40px] text-xs ${selectedCategory === cat ? 'active' : ''}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar — Desktop */}
          <aside className="hidden sm:block w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Brand Filter */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Brand</h3>
                <p className="text-xs text-muted-foreground italic">No brands joined yet</p>
              </div>

              {/* Price Range */}
              <div className="border-t border-border pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Price Range</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Under ₹500', min: 0, max: 500 },
                    { label: '₹500 – ₹1,000', min: 500, max: 1000 },
                    { label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
                    { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
                    { label: 'All Prices', min: 0, max: 5000 },
                  ].map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange({ min: range.min, max: range.max })}
                      className={`flex items-center gap-2.5 w-full text-left text-sm transition-colors min-h-[36px] ${
                        priceRange.min === range.min && priceRange.max === range.max
                          ? 'text-primary font-semibold' :'text-foreground hover:text-primary font-normal'
                      }`}>
                      <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 transition-colors ${
                        priceRange.min === range.min && priceRange.max === range.max
                          ? 'bg-primary border-primary' :'border-border'
                      }`} />
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange({ min: 0, max: 5000 });
                  }}
                  className="text-xs font-medium text-primary hover:opacity-70 transition-opacity flex items-center gap-1.5">
                  <Icon name="XMarkIcon" size={12} variant="outline" />
                  Reset All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 sm:hidden">
              <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-background p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-foreground">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                    <Icon name="XMarkIcon" size={20} variant="outline" />
                  </button>
                </div>
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Under ₹500', min: 0, max: 500 },
                      { label: '₹500 – ₹1,000', min: 500, max: 1000 },
                      { label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
                      { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
                      { label: 'All Prices', min: 0, max: 5000 },
                    ].map((range) => (
                      <button
                        key={range.label}
                        onClick={() => { setPriceRange({ min: range.min, max: range.max }); setSidebarOpen(false); }}
                        className={`flex items-center gap-2.5 w-full text-left text-sm min-h-[44px] transition-colors ${
                          priceRange.min === range.min && priceRange.max === range.max
                            ? 'text-primary font-semibold' :'text-foreground'
                        }`}>
                        <span className={`w-4 h-4 rounded-full border flex-shrink-0 ${
                          priceRange.min === range.min && priceRange.max === range.max
                            ? 'bg-primary border-primary' :'border-border'
                        }`} />
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange({ min: 0, max: 5000 });
                    setSidebarOpen(false);
                  }}
                  className="w-full py-3 border border-border text-foreground text-sm font-medium rounded-sm hover:border-foreground transition-colors">
                  Reset All Filters
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-sm bg-secondary/10 py-20 px-6 flex flex-col items-center justify-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Icon name="ShoppingBagIcon" size={32} variant="outline" className="text-primary" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  No Products Found
                </h3>
                <p className="text-muted-foreground text-sm font-light max-w-md mb-8 leading-relaxed">
                  Try adjusting your filters or browse other categories.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange({ min: 0, max: 5000 });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity min-h-[48px]">
                  <Icon name="XMarkIcon" size={16} variant="outline" />
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product, idx) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group">
                    <div className="bg-card rounded-sm overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      {/* Product Image */}
                      <div className="relative aspect-square bg-muted overflow-hidden group-hover:bg-primary/10 transition-colors">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.badge && (
                          <span className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-sm">
                            {product.badge}
                          </span>
                        )}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-3 sm:p-4 flex-1 flex flex-col">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">
                          {product.brandName}
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2 text-[10px] text-muted-foreground">
                          <Icon name="StarIcon" size={12} variant="solid" className="text-primary" />
                          <span>{product.rating}</span>
                          <span>({product.reviews})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3 flex-1 items-end">
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            ₹{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                          className="w-full px-2 py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
