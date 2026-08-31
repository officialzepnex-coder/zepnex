'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { brands as staticBrands, type Brand } from '@/data/brands';
import { products as staticProducts, type Product } from '@/data/products';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { mapBrand, mapProduct } from '@/lib/mappers';
import { DEFAULT_HOMEPAGE, type FaqRow, type HomepageSettings, type ReviewRow } from '@/types/database';
import { DataService } from './supabase/data-service';

export const DEFAULT_CATEGORIES = [
  'Clothing',
  'Daily Use',
  'Electronics',
  'Home & Living',
  'Beauty',
  'Sports',
];

interface CatalogState {
  brands: Brand[];
  products: Product[];
  categories: string[];
  testimonials: ReviewRow[];
  reviews: ReviewRow[];
  faqs: FaqRow[];
  homepage: HomepageSettings;
  loading: boolean;
  usingFallback: boolean;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogState>({
  brands: staticBrands,
  products: staticProducts,
  categories: DEFAULT_CATEGORIES,
  testimonials: [],
  reviews: [],
  faqs: [],
  homepage: DEFAULT_HOMEPAGE,
  loading: false,
  usingFallback: true,
  refresh: async () => {},
});

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<CatalogState, 'refresh'>>({
    brands: staticBrands,
    products: staticProducts,
    categories: DEFAULT_CATEGORIES,
    testimonials: [],
    reviews: [],
    faqs: [],
    homepage: DEFAULT_HOMEPAGE,
    loading: true,
    usingFallback: !isSupabaseConfigured(),
  });

  const loadData = useCallback(async () => {
    try {
      const [brandRows, prodRows, catRows, revRows, faqRows, homeSettings] = await Promise.all([
        DataService.getBrands(),
        DataService.getProducts(),
        DataService.getCategories(),
        DataService.getReviews(),
        DataService.getFaqs(),
        DataService.getHomepageSettings(),
      ]);

      const publishedBrands = brandRows.filter((b) => b.published !== false);
      const publishedProducts = prodRows.filter((p) => p.published !== false);
      const publishedCats = catRows.filter((c) => c.published !== false).map((c) => c.name);
      const publishedReviews = revRows.filter((r) => r.published !== false);
      const publishedFaqs = faqRows.filter((f) => f.published !== false);

      setState({
        brands: publishedBrands.length > 0 ? publishedBrands.map(mapBrand) : staticBrands,
        products: publishedProducts.length > 0 ? publishedProducts.map(mapProduct) : staticProducts,
        categories: publishedCats.length > 0 ? publishedCats : DEFAULT_CATEGORIES,
        testimonials: publishedReviews.filter((r) => r.kind === 'homepage'),
        reviews: publishedReviews,
        faqs: publishedFaqs,
        homepage: homeSettings || DEFAULT_HOMEPAGE,
        loading: false,
        usingFallback: !isSupabaseConfigured(),
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false, usingFallback: true }));
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for real-time local updates made inside Admin Panel
    const handleUpdate = () => {
      loadData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('zepnex_catalog_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('zepnex_catalog_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      }
    };
  }, [loadData]);

  const value = useMemo(
    () => ({
      ...state,
      refresh: loadData,
    }),
    [state, loadData]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}

