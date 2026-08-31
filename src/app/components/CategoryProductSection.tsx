'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { products } from '@/data/products';

const categories = ['All', 'Clothing', 'Daily Use', 'Electronics', 'Home & Living', 'Beauty', 'Sports'];

export default function CategoryProductSection() {
  const [activeCategory, setActiveCategory] = useState('All');
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
    <section ref={sectionRef} className="py-16 sm:py-24 bg-secondary/30 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div className="animate-on-scroll opacity-100">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-2 block">Browse</span>
            <h2 className="font-display text-section-lg text-foreground font-semibold">
              Trending <span className="italic font-light">Products</span>
            </h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-primary border-b border-primary pb-0.5 hover:opacity-70 transition-opacity flex items-center gap-1.5 animate-on-scroll opacity-100">
            View All Products
            <Icon name="ArrowRightIcon" size={14} variant="outline" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {categories?.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-pill flex-shrink-0 min-h-[44px] ${activeCategory === cat ? 'active' : ''}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="animate-on-scroll opacity-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products
              .filter(p => activeCategory === 'All' || p.category === activeCategory)
              .slice(0, 8)
              .map((product, idx) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group animate-on-scroll opacity-100"
                  style={{ animationDelay: `${idx * 60}ms` }}>
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
        </div>
      </div>
    </section>
  );
}