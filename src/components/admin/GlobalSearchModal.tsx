'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  Store,
  Tags,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  PanelsTopLeft,
  Database,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { DataService } from '@/lib/supabase/data-service';
import type { BrandRow, ProductRow, CategoryRow, FaqRow, ApplicationRow } from '@/types/database';

interface SearchResultItem {
  id: string;
  type: 'page' | 'product' | 'brand' | 'category' | 'faq' | 'application';
  title: string;
  subtitle?: string;
  badge?: string;
  href: string;
  icon: React.ElementType;
}

const STATIC_PAGES: SearchResultItem[] = [
  { id: 'page-overview', type: 'page', title: 'Dashboard Overview', subtitle: 'Live marketplace metrics, revenue & charts', href: '/admin', icon: LayoutDashboard },
  { id: 'page-products', type: 'page', title: 'Products Catalog', subtitle: 'Manage prices, stock, images & tags', href: '/admin/products', icon: Package },
  { id: 'page-new-product', type: 'page', title: 'Add New Product', subtitle: 'Create a new marketplace listing', href: '/admin/products/new', icon: Package, badge: 'Action' },
  { id: 'page-brands', type: 'page', title: 'Partner Brands', subtitle: 'Manage brands, logos, bios & verification', href: '/admin/brands', icon: Store },
  { id: 'page-new-brand', type: 'page', title: 'Add New Brand', subtitle: 'Create a brand partner profile', href: '/admin/brands/new', icon: Store, badge: 'Action' },
  { id: 'page-categories', type: 'page', title: 'Categories Matrix', subtitle: 'Organize catalog categories & order', href: '/admin/categories', icon: Tags },
  { id: 'page-reviews', type: 'page', title: 'Reviews & Testimonials', subtitle: 'Approve ratings, customer feedback & testimonials', href: '/admin/reviews', icon: Sparkles },
  { id: 'page-applications', type: 'page', title: 'Brand Inbound Applications', subtitle: 'Review and approve merchant signups', href: '/admin/applications', icon: Inbox },
  { id: 'page-faqs', type: 'page', title: 'FAQs & Help Center', subtitle: 'Manage merchant & buyer help articles', href: '/admin/faqs', icon: HelpCircle },
  { id: 'page-content', type: 'page', title: 'Homepage Hero & Storefront', subtitle: 'Live split-screen hero editor', href: '/admin/content', icon: PanelsTopLeft },
  { id: 'page-sync', type: 'page', title: 'Supabase Database & Sync Hub', subtitle: '1-Click sample data sync & table metrics', href: '/admin/sync', icon: Database, badge: 'Database' },
];

export default function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);

  useEffect(() => {
    if (isOpen) {
      DataService.getBrands().then(setBrands);
      DataService.getProducts().then(setProducts);
      DataService.getCategories().then(setCategories);
      DataService.getFaqs().then(setFaqs);
      DataService.getApplications().then(setApplications);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return STATIC_PAGES;
    }

    const matchedPages = STATIC_PAGES.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.subtitle && p.subtitle.toLowerCase().includes(q))
    );

    const matchedProducts: SearchResultItem[] = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.brand_name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        id: `prod-${p.id}`,
        type: 'product',
        title: p.name,
        subtitle: `₹${p.price} · ${p.brand_name} · ${p.category}`,
        badge: p.in_stock ? 'In Stock' : 'Out of Stock',
        href: `/admin/products/${p.id}`,
        icon: Package,
      }));

    const matchedBrands: SearchResultItem[] = brands
      .filter((b) => b.name.toLowerCase().includes(q) || b.location.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q))
      .slice(0, 4)
      .map((b) => ({
        id: `brand-${b.id}`,
        type: 'brand',
        title: b.name,
        subtitle: `${b.location} · ⭐ ${b.rating} (${b.reviews} reviews)`,
        badge: b.verified ? 'Verified' : undefined,
        href: `/admin/brands/${b.id}`,
        icon: Store,
      }));

    const matchedCategories: SearchResultItem[] = categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({
        id: `cat-${c.id}`,
        type: 'category',
        title: `Category: ${c.name}`,
        subtitle: `Order #${c.sort_order}`,
        href: `/admin/categories`,
        icon: Tags,
      }));

    const matchedFaqs: SearchResultItem[] = faqs
      .filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
      .slice(0, 3)
      .map((f) => ({
        id: `faq-${f.id}`,
        type: 'faq',
        title: f.question,
        subtitle: f.category || 'FAQ',
        href: `/admin/faqs`,
        icon: HelpCircle,
      }));

    const matchedApps: SearchResultItem[] = applications
      .filter((a) => a.brand_name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
      .slice(0, 3)
      .map((a) => ({
        id: `app-${a.id}`,
        type: 'application',
        title: `Application: ${a.brand_name}`,
        subtitle: `${a.email} · Status: ${a.status.toUpperCase()}`,
        badge: a.status,
        href: `/admin/applications`,
        icon: Inbox,
      }));

    return [...matchedPages, ...matchedProducts, ...matchedBrands, ...matchedCategories, ...matchedFaqs, ...matchedApps];
  }, [query, products, brands, categories, faqs, applications]);

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      onClose();
      router.push(item.href);
    },
    [router, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#1C1A16] text-white border border-white/15 rounded-lg shadow-2xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            autoFocus
            className="flex-1 bg-transparent text-white placeholder-white/40 text-base focus:outline-none"
            placeholder="Search products, brands, categories, FAQs, or navigate..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/40 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-white/10 text-white/60">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-white/5">
          {results.length === 0 ? (
            <div className="py-12 text-center text-white/50 text-sm">
              <p>No results found for &ldquo;<span className="text-white">{query}</span>&rdquo;</p>
              <p className="text-xs text-white/30 mt-1">Try searching by product title, brand name, or category.</p>
            </div>
          ) : (
            results.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-md cursor-pointer transition-all ${
                    isSelected ? 'bg-primary text-white shadow-md' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-md shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : item.badge === 'Verified' || item.badge === 'In Stock'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-white/20'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#14120E] border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white/80">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white/80">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white/80">↵</kbd> to open
            </span>
          </div>
          <span className="text-primary font-medium">ZEPNEX Universal Search</span>
        </div>
      </div>
    </div>
  );
}
