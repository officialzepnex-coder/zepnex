'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { brands as staticBrands, type Brand } from '@/data/brands';
import { products as staticProducts, type Product } from '@/data/products';
import { isDemoAdminMode, isSupabaseConfigured } from '@/lib/supabase/config';
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
    usingFallback: !isSupabaseConfigured() || isDemoAdminMode(),
  });

  const applyCatalogData = useCallback((data: Awaited<ReturnType<typeof DataService.getPublicCatalog>>, loading: boolean) => {
    const { brandRows, productRows, categoryRows, reviewRows, faqRows, homepageSettings } = data;
    const publishedCats = categoryRows.map((c) => c.name);

    setState({
      brands: brandRows.length > 0 ? brandRows.map(mapBrand) : staticBrands,
      products: productRows.length > 0 ? productRows.map(mapProduct) : staticProducts,
      categories: publishedCats.length > 0 ? publishedCats : DEFAULT_CATEGORIES,
      testimonials: reviewRows.filter((r) => r.kind === 'homepage'),
      reviews: reviewRows,
      faqs: faqRows,
      homepage: homepageSettings || DEFAULT_HOMEPAGE,
      loading,
      usingFallback: !isSupabaseConfigured() || isDemoAdminMode(),
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      applyCatalogData(DataService.getCachedPublicCatalog(), true);
      const catalog = await DataService.getPublicCatalog();
      applyCatalogData(catalog, false);
    } catch {
      setState((prev) => ({ ...prev, loading: false, usingFallback: true }));
    }
  }, [applyCatalogData]);

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

