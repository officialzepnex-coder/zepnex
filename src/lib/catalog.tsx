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
      usingFallback: !isSupabaseConfigured(),
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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

const CartContext = createContext<CartState>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('zepnex_cart');
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('zepnex_cart', JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('zepnex_cart_updated'));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      return existing
        ? current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry)
        : [...current, { ...item, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) => quantity > 0 ? current.map((item) => item.id === id ? { ...item, quantity } : item) : current.filter((item) => item.id !== id));
  }, []);

  const removeItem = useCallback((id: string) => updateQuantity(id, 0), [updateQuantity]);

  return <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

