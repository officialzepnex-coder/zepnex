'use client';

import { createClient } from './client';
import { isSupabaseConfigured } from './config';
import { brands as initialBrands } from '@/data/brands';
import { products as initialProducts } from '@/data/products';
import {
  DEFAULT_HOMEPAGE,
  type BrandRow,
  type ProductRow,
  type CategoryRow,
  type ReviewRow,
  type ApplicationRow,
  type FaqRow,
  type HomepageSettings,
  type ActivityLog,
  type TeamMemberRow,
} from '@/types/database';
import { slugify } from '@/lib/mappers';

const LOCAL_STORAGE_KEY_PREFIX = 'zepnex_admin_';

const INITIAL_CATEGORIES: CategoryRow[] = [
  { id: 'clothing', name: 'Clothing', sort_order: 1, published: true, icon: 'Shirt' },
  { id: 'daily-use', name: 'Daily Use', sort_order: 2, published: true, icon: 'ShoppingBag' },
  { id: 'electronics', name: 'Electronics', sort_order: 3, published: true, icon: 'Smartphone' },
  { id: 'home-living', name: 'Home & Living', sort_order: 4, published: true, icon: 'Home' },
  { id: 'beauty', name: 'Beauty', sort_order: 5, published: true, icon: 'Sparkles' },
  { id: 'sports', name: 'Sports', sort_order: 6, published: true, icon: 'Activity' },
];

const INITIAL_REVIEWS: ReviewRow[] = [
  {
    id: 'rev-1',
    kind: 'homepage',
    brand_id: null,
    product_id: null,
    author: 'Ananya Mehta',
    role: 'Mumbai',
    rating: 5,
    comment: 'Found unique brands I never would have discovered otherwise. Quality is consistently excellent.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rev-2',
    kind: 'homepage',
    brand_id: null,
    product_id: null,
    author: 'Rahul Iyer',
    role: 'Bengaluru',
    rating: 5,
    comment: 'Prices are fair and the curated brands feel premium without the usual marketplace chaos.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rev-3',
    kind: 'homepage',
    brand_id: null,
    product_id: null,
    author: 'Sana Qureshi',
    role: 'Delhi',
    rating: 4,
    comment: 'Love shopping from small Indian labels in one place. Delivery and packaging were solid.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sana',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rev-4',
    kind: 'brand',
    brand_id: 'brand-1',
    product_id: null,
    author: 'Vikram Joshi',
    role: 'Verified Buyer',
    rating: 5,
    comment: 'Exceptional craftsmanship and true-to-fit sizing. Will be ordering more!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_FAQS: FaqRow[] = [
  {
    id: 'faq-1',
    question: 'What are the eligibility requirements to join as a brand?',
    answer: 'Your brand should have active operations with genuine original products, appropriate licensing, and a commitment to customer satisfaction.',
    category: 'Brand Onboarding',
    sort_order: 1,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-2',
    question: 'How fast does brand approval take?',
    answer: 'Most brand applications are reviewed and approved within 24 to 48 business hours by our merchant verification team.',
    category: 'Brand Onboarding',
    sort_order: 2,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-3',
    question: 'Can a brand list products across multiple categories?',
    answer: 'Yes! Brands can showcase products across multiple categories (e.g. Clothing, Accessories, Daily Use) from their unified catalog.',
    category: 'Catalog & Listing',
    sort_order: 3,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_APPLICATIONS: ApplicationRow[] = [
  {
    id: 'app-1',
    brand_name: 'Aura Artisans',
    email: 'contact@aurascrafts.in',
    phone: '+91 98765 43210',
    category: 'Home & Living',
    message: 'We create handmade brass decor and handwoven wall hangings with 30+ artisan families across Rajasthan.',
    status: 'pending',
    notes: 'Promising artisan catalog. Sent initial catalog template.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'app-2',
    brand_name: 'PureVeda Naturals',
    email: 'partner@pureveda.com',
    phone: '+91 91234 56789',
    category: 'Beauty',
    message: 'Ayurvedic certified organic cold-pressed oils and herbal hair serums with cruelty-free certification.',
    status: 'pending',
    notes: 'Reviewing lab test certifications.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'app-3',
    brand_name: 'UrbanStride Footwear',
    email: 'founder@urbanstride.in',
    phone: '+91 99887 76655',
    category: 'Sports',
    message: 'Ergonomic athletic lifestyle footwear engineered with recycled oceanic plastic fibres.',
    status: 'approved',
    notes: 'Approved for onboarding. Merchant contract signed.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_TEAM_MEMBERS: TeamMemberRow[] = [
  { id: 'team-1', name: 'Aarav Sharma', role: 'Head of Growth', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', bio: 'Drives acquisition, partnerships, and marketplace scale across India.', sort_order: 1, published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-2', name: 'Meera Kapoor', role: 'Brand Partnerships Lead', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', bio: 'Builds relationships with emerging brands and helps them launch faster.', sort_order: 2, published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-3', name: 'Rohan Verma', role: 'Marketplace Operations', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', bio: 'Makes sure every order, listing, and delivery flow runs smoothly.', sort_order: 3, published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-4', name: 'Nisha Sethi', role: 'Customer Experience', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80', bio: 'Creates a trusted and effortless shopping experience for every customer.', sort_order: 4, published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-5', name: 'Karan Malhotra', role: 'UI & Experience Designer', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80', bio: 'Shapes the aesthetic and product experience across ZEPNEX touchpoints.', sort_order: 5, published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-6', name: 'Sana Ali', role: 'AI Product Specialist', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', bio: 'Helps build intelligence features that guide shoppers and sellers better.', sort_order: 6, published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

function getInitialBrandRows(): BrandRow[] {
  return initialBrands.map((b) => ({
    id: b.id,
    name: b.name,
    tagline: b.tagline,
    logo: b.logo,
    cover_image: b.coverImage,
    location: b.location,
    rating: b.rating,
    reviews: b.reviews,
    followers: b.followers,
    product_count: b.productCount,
    description: b.description,
    verified: b.verified,
    website: b.website || null,
    contact_email: b.contactEmail || null,
    featured: true,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

function getInitialProductRows(): ProductRow[] {
  return initialProducts.map((p) => ({
    id: p.id,
    name: p.name,
    brand_id: p.brandId,
    brand_name: p.brandName,
    category: p.category,
    price: p.price,
    original_price: p.originalPrice || null,
    rating: p.rating,
    reviews: p.reviews,
    image: p.image,
    images: p.images || [],
    description: p.description,
    in_stock: p.inStock,
    stock_quantity: p.inStock ? 45 : 0,
    badge: p.badge || null,
    featured: Boolean(p.badge === 'Sale' || p.badge === 'Best Seller'),
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// Local Storage helpers
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    // Trigger storage event for live tab updates
    window.dispatchEvent(new CustomEvent('zepnex_catalog_updated', { detail: { key } }));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Data Service Singleton
export class DataService {
  public static getCachedPublicCatalog() {
    const brandRows = getLocal<BrandRow[]>('brands', getInitialBrandRows()).filter((b) => b.published !== false);
    const productRows = getLocal<ProductRow[]>('products', getInitialProductRows()).filter((p) => p.published !== false);
    const categoryRows = getLocal<CategoryRow[]>('categories', INITIAL_CATEGORIES).filter((c) => c.published !== false);
    const reviewRows = getLocal<ReviewRow[]>('reviews', INITIAL_REVIEWS).filter((r) => r.published !== false);
    const faqRows = getLocal<FaqRow[]>('faqs', INITIAL_FAQS).filter((f) => f.published !== false);

    return {
      brandRows,
      productRows,
      categoryRows,
      reviewRows,
      faqRows,
      homepageSettings: getLocal<HomepageSettings>('homepage_settings', DEFAULT_HOMEPAGE),
    };
  }

  public static async getPublicCatalog() {
    if (!isSupabaseConfigured()) {
      return this.getCachedPublicCatalog();
    }

    try {
      const supabase = createClient();
      const [brandsResult, productsResult, categoriesResult, reviewsResult, faqsResult, homepageResult] = await Promise.all([
        supabase
          .from('brands')
          .select('id,name,tagline,logo,cover_image,location,rating,reviews,followers,product_count,description,verified,website,contact_email,featured,published,created_at,updated_at')
          .eq('published', true)
          .order('name'),
        supabase
          .from('products')
          .select('id,name,brand_id,brand_name,category,price,original_price,rating,reviews,image,images,description,in_stock,stock_quantity,badge,featured,published,created_at,updated_at')
          .eq('published', true)
          .order('name'),
        supabase
          .from('categories')
          .select('id,name,sort_order,published,icon')
          .eq('published', true)
          .order('sort_order'),
        supabase
          .from('reviews')
          .select('id,kind,brand_id,product_id,author,role,rating,comment,avatar,published,created_at,updated_at')
          .eq('published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('faqs')
          .select('id,question,answer,category,sort_order,published,created_at,updated_at')
          .eq('published', true)
          .order('sort_order'),
        supabase.from('site_settings').select('key,value,updated_at').eq('key', 'homepage').maybeSingle(),
      ]);

      const results = [brandsResult, productsResult, categoriesResult, reviewsResult, faqsResult, homepageResult];
      const failed = results.find((result) => result.error);
      if (failed?.error) {
        console.warn('Falling back to cached public catalog:', failed.error.message);
        return this.getCachedPublicCatalog();
      }

      const brandRows = (brandsResult.data || []) as BrandRow[];
      const productRows = (productsResult.data || []) as ProductRow[];
      const categoryRows = (categoriesResult.data || []) as CategoryRow[];
      const reviewRows = (reviewsResult.data || []) as ReviewRow[];
      const faqRows = (faqsResult.data || []) as FaqRow[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawHomepage = (homepageResult.data as any)?.value;
      const homepageSettings = rawHomepage ? { ...DEFAULT_HOMEPAGE, ...(rawHomepage as object) } : DEFAULT_HOMEPAGE;

      setLocal('brands', brandRows);
      setLocal('products', productRows);
      setLocal('categories', categoryRows);
      setLocal('reviews', reviewRows);
      setLocal('faqs', faqRows);
      setLocal('homepage_settings', homepageSettings);

      return { brandRows, productRows, categoryRows, reviewRows, faqRows, homepageSettings };
    } catch (error) {
      console.warn('Falling back to cached public catalog:', error);
      return this.getCachedPublicCatalog();
    }
  }

  public static async checkConnection(): Promise<{ ok: boolean; message: string; isFallback: boolean }> {
    if (!isSupabaseConfigured()) {
      return {
        ok: true,
        isFallback: true,
        message: 'Running in Local/Demo Mode (Persistent Cache). Add Supabase keys to connect live database.',
      };
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.from('site_settings').select('key').limit(1);
      if (error) {
        return {
          ok: false,
          isFallback: true,
          message: `Supabase Error: ${error.message}. Using offline local cache.`,
        };
      }
      return {
        ok: true,
        isFallback: false,
        message: 'Connected to Supabase PostgreSQL Database.',
      };
    } catch (err) {
      return {
        ok: false,
        isFallback: true,
        message: `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}. Using local cache.`,
      };
    }
  }

  // Activity Logs
  public static getLogs(): ActivityLog[] {
    return getLocal<ActivityLog[]>('activity_logs', [
      {
        id: 'log-1',
        action: 'sync',
        entity: 'database',
        title: 'Catalog Data Synced',
        details: 'Initial sample products, brands, and categories initialized.',
        timestamp: new Date().toISOString(),
      },
    ]);
  }

  public static addLog(action: ActivityLog['action'], entity: ActivityLog['entity'], title: string, details?: string, entity_id?: string) {
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      action,
      entity,
      entity_id,
      title,
      details,
      timestamp: new Date().toISOString(),
    };
    setLocal('activity_logs', [newLog, ...logs.slice(0, 49)]);
  }

  // BRANDS
  public static async getBrands(): Promise<BrandRow[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('brands').select('*').order('name');
        if (!error && data) {
          setLocal('brands', data as BrandRow[]);
          return data as BrandRow[];
        }
        if (error) console.warn('Falling back to local brands:', error.message);
      } catch (e) {
        console.warn('Falling back to local brands:', e);
      }
    }
    return getLocal<BrandRow[]>('brands', getInitialBrandRows());
  }

  public static async getBrandById(id: string): Promise<BrandRow | null> {
    const brands = await this.getBrands();
    return brands.find((b) => b.id === id) || null;
  }

  public static async saveBrand(brand: Partial<BrandRow>): Promise<BrandRow> {
    let saved: BrandRow;
    const isNew = !brand.id;
    const id = brand.id || 'brand-' + Date.now();
    const now = new Date().toISOString();

    const payload: BrandRow = {
      id,
      name: brand.name || 'Untitled Brand',
      tagline: brand.tagline || '',
      logo: brand.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(brand.name || 'Brand')}&backgroundColor=c084fc&textColor=ffffff`,
      cover_image: brand.cover_image || 'https://img.rocket.new/generatedImages/rocket_gen_img_2bc4c88d8-1773225914256.png',
      location: brand.location || 'India',
      rating: Number(brand.rating) || 4.5,
      reviews: Number(brand.reviews) || 0,
      followers: Number(brand.followers) || 0,
      product_count: Number(brand.product_count) || 0,
      description: brand.description || '',
      verified: Boolean(brand.verified),
      website: brand.website || null,
      contact_email: brand.contact_email || null,
      featured: brand.featured ?? true,
      published: brand.published ?? true,
      created_at: brand.created_at || now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('brands') as any).upsert(payload).select('*').single();
        if (error) throw new Error(`Brand save failed: ${error.message}`);
        if (!data) throw new Error('Brand save failed: Supabase returned no record.');
        saved = data as BrandRow;
      } catch (error) {
        throw error instanceof Error ? error : new Error('Brand save failed.');
      }
    } else {
      saved = payload;
    }

    const current = getLocal<BrandRow[]>('brands', getInitialBrandRows());
    const exists = current.some((b) => b.id === saved.id);
    const updated = exists ? current.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...current];
    setLocal('brands', updated);

    this.addLog(isNew ? 'create' : 'update', 'brand', `${isNew ? 'Added' : 'Updated'} brand "${saved.name}"`, undefined, saved.id);
    return saved;
  }

  public static async deleteBrand(id: string): Promise<boolean> {
    const brands = await this.getBrands();
    const brand = brands.find((b) => b.id === id);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('brands').delete().eq('id', id);
        if (error) throw new Error(`Brand delete failed: ${error.message}`);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Brand delete failed.');
      }
    }

    const updated = brands.filter((b) => b.id !== id);
    setLocal('brands', updated);
    this.addLog('delete', 'brand', `Deleted brand "${brand?.name || id}"`, undefined, id);
    return true;
  }

  // PRODUCTS
  public static async getProducts(): Promise<ProductRow[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (!error && data) {
          setLocal('products', data as ProductRow[]);
          return data as ProductRow[];
        }
        if (error) console.warn('Falling back to local products:', error.message);
      } catch (e) {
        console.warn('Falling back to local products:', e);
      }
    }
    return getLocal<ProductRow[]>('products', getInitialProductRows());
  }

  public static async getProductById(id: string): Promise<ProductRow | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  }

  public static async saveProduct(product: Partial<ProductRow>): Promise<ProductRow> {
    let saved: ProductRow;
    const isNew = !product.id;
    const id = product.id || 'prod-' + Date.now();
    const now = new Date().toISOString();

    const brands = await this.getBrands();
    const assignedBrand = brands.find((b) => b.id === product.brand_id);
    const brandName = product.brand_name || assignedBrand?.name || 'Partner Brand';

    const payload: ProductRow = {
      id,
      name: product.name || 'Untitled Product',
      brand_id: product.brand_id || brands[0]?.id || 'brand-1',
      brand_name: brandName,
      category: product.category || 'Clothing',
      price: Number(product.price) || 0,
      original_price: product.original_price ? Number(product.original_price) : null,
      rating: Number(product.rating) || 4.5,
      reviews: Number(product.reviews) || 0,
      image: product.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=newprod&scale=80',
      images: product.images || [],
      description: product.description || '',
      in_stock: product.in_stock ?? true,
      stock_quantity: product.stock_quantity ?? (product.in_stock ? 50 : 0),
      badge: product.badge || null,
      featured: product.featured ?? false,
      published: product.published ?? true,
      created_at: product.created_at || now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('products') as any).upsert(payload).select('*').single();
        if (error) throw new Error(`Product save failed: ${error.message}`);
        if (!data) throw new Error('Product save failed: Supabase returned no record.');
        saved = data as ProductRow;
      } catch (error) {
        throw error instanceof Error ? error : new Error('Product save failed.');
      }
    } else {
      saved = payload;
    }

    const current = getLocal<ProductRow[]>('products', getInitialProductRows());
    const exists = current.some((p) => p.id === saved.id);
    const updated = exists ? current.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...current];
    setLocal('products', updated);

    this.addLog(isNew ? 'create' : 'update', 'product', `${isNew ? 'Added' : 'Updated'} product "${saved.name}"`, `₹${saved.price} · ${saved.category}`, saved.id);
    return saved;
  }

  public static async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === id);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete product failed:', e);
      }
    }

    const updated = products.filter((p) => p.id !== id);
    setLocal('products', updated);
    this.addLog('delete', 'product', `Deleted product "${product?.name || id}"`, undefined, id);
    return true;
  }

  public static async bulkDeleteProducts(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const products = await this.getProducts();

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('products').delete().in('id', ids);
      } catch (e) {
        console.warn('Bulk delete failed in Supabase:', e);
      }
    }

    const updated = products.filter((p) => !ids.includes(p.id));
    setLocal('products', updated);
    this.addLog('delete', 'product', `Bulk deleted ${ids.length} products`);
  }

  public static async bulkUpdateProductStatus(ids: string[], updates: Partial<ProductRow>): Promise<void> {
    if (ids.length === 0) return;
    const products = await this.getProducts();

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('products') as any).update(updates).in('id', ids);
      } catch (e) {
        console.warn('Bulk update failed in Supabase:', e);
      }
    }

    const updated = products.map((p) => (ids.includes(p.id) ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
    setLocal('products', updated);
    this.addLog('update', 'product', `Bulk updated ${ids.length} products`);
  }

  // CATEGORIES
  public static async getCategories(): Promise<CategoryRow[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('categories').select('*').order('sort_order');
        if (!error && data) {
          setLocal('categories', data as CategoryRow[]);
          return data as CategoryRow[];
        }
        if (error) console.warn('Falling back to local categories:', error.message);
      } catch (e) {
        console.warn('Falling back to local categories:', e);
      }
    }
    return getLocal<CategoryRow[]>('categories', INITIAL_CATEGORIES);
  }

  public static async saveCategory(category: Partial<CategoryRow>): Promise<CategoryRow> {
    const id = category.id || slugify(category.name || 'new-category');
    const categories = await this.getCategories();
    const payload: CategoryRow = {
      id,
      name: category.name || 'New Category',
      sort_order: category.sort_order ?? categories.length + 1,
      published: category.published ?? true,
      icon: category.icon || 'Folder',
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('categories') as any).upsert(payload);
      } catch (e) {
        console.warn('Supabase upsert category failed:', e);
      }
    }

    const exists = categories.some((c) => c.id === id);
    const updated = exists ? categories.map((c) => (c.id === id ? payload : c)) : [...categories, payload];
    setLocal('categories', updated);
    this.addLog(exists ? 'update' : 'create', 'category', `${exists ? 'Updated' : 'Created'} category "${payload.name}"`, undefined, id);
    return payload;
  }

  public static async deleteCategory(id: string): Promise<boolean> {
    const categories = await this.getCategories();
    const cat = categories.find((c) => c.id === id);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('categories').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete category failed:', e);
      }
    }

    const updated = categories.filter((c) => c.id !== id);
    setLocal('categories', updated);
    this.addLog('delete', 'category', `Deleted category "${cat?.name || id}"`, undefined, id);
    return true;
  }

  // REVIEWS
  public static async getReviews(): Promise<ReviewRow[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setLocal('reviews', data as ReviewRow[]);
          return data as ReviewRow[];
        }
        if (error) console.warn('Falling back to local reviews:', error.message);
      } catch (e) {
        console.warn('Falling back to local reviews:', e);
      }
    }
    return getLocal<ReviewRow[]>('reviews', INITIAL_REVIEWS);
  }

  public static async saveReview(review: Partial<ReviewRow>): Promise<ReviewRow> {
    const isNew = !review.id;
    const id = review.id || 'rev-' + Date.now();
    const now = new Date().toISOString();
    const payload: ReviewRow = {
      id,
      kind: review.kind || 'homepage',
      brand_id: review.kind === 'brand' ? review.brand_id || null : null,
      product_id: review.kind === 'product' ? review.product_id || null : null,
      author: review.author || 'Anonymous',
      role: review.role || null,
      rating: Math.max(1, Math.min(5, Number(review.rating) || 5)),
      comment: review.comment || '',
      avatar: review.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(review.author || 'user')}`,
      published: review.published ?? true,
      created_at: review.created_at || now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('reviews') as any).upsert(payload);
      } catch (e) {
        console.warn('Supabase upsert review failed:', e);
      }
    }

    const current = await this.getReviews();
    const exists = current.some((r) => r.id === id);
    const updated = exists ? current.map((r) => (r.id === id ? payload : r)) : [payload, ...current];
    setLocal('reviews', updated);
    this.addLog(isNew ? 'create' : 'update', 'review', `${isNew ? 'Added' : 'Updated'} review from "${payload.author}"`, `${payload.rating} Stars · ${payload.kind}`, id);
    return payload;
  }

  public static async deleteReview(id: string): Promise<boolean> {
    const current = await this.getReviews();
    const review = current.find((r) => r.id === id);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('reviews').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete review failed:', e);
      }
    }

    const updated = current.filter((r) => r.id !== id);
    setLocal('reviews', updated);
    this.addLog('delete', 'review', `Deleted review from "${review?.author || id}"`, undefined, id);
    return true;
  }

  // BRAND APPLICATIONS
  public static async getApplications(): Promise<ApplicationRow[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('brand_applications').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setLocal('brand_applications', data as ApplicationRow[]);
          return data as ApplicationRow[];
        }
        if (error) console.warn('Falling back to local applications:', error.message);
      } catch (e) {
        console.warn('Falling back to local applications:', e);
      }
    }
    return getLocal<ApplicationRow[]>('brand_applications', INITIAL_APPLICATIONS);
  }

  public static async saveApplication(app: Partial<ApplicationRow>): Promise<ApplicationRow> {
    const id = app.id || 'app-' + Date.now();
    const now = new Date().toISOString();
    const payload: ApplicationRow = {
      id,
      brand_name: app.brand_name || 'Inbound Brand',
      email: app.email || '',
      phone: app.phone || null,
      category: app.category || null,
      message: app.message || null,
      status: app.status || 'pending',
      notes: app.notes || null,
      created_at: app.created_at || now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('brand_applications') as any).upsert(payload);
      } catch (e) {
        console.warn('Supabase upsert application failed:', e);
      }
    }

    const current = await this.getApplications();
    const exists = current.some((a) => a.id === id);
    const updated = exists ? current.map((a) => (a.id === id ? payload : a)) : [payload, ...current];
    setLocal('brand_applications', updated);
    this.addLog(exists ? 'update' : 'create', 'application', `Application for "${payload.brand_name}" status: ${payload.status.toUpperCase()}`, payload.email, id);
    return payload;
  }

  public static async convertApplicationToBrand(app: ApplicationRow): Promise<BrandRow> {
    const newBrand = await this.saveBrand({
      name: app.brand_name,
      tagline: `Artisan & lifestyle brand from ${app.category || 'India'}`,
      description: app.message || `Welcome ${app.brand_name} to ZEPNEX!`,
      contact_email: app.email,
      location: 'India',
      rating: 5.0,
      reviews: 1,
      followers: 120,
      product_count: 0,
      verified: true,
      featured: true,
      published: true,
    });

    await this.saveApplication({
      ...app,
      status: 'approved',
      notes: (app.notes ? app.notes + '\n' : '') + `Converted to active brand on ${new Date().toLocaleDateString()}`,
    });

    this.addLog('create', 'brand', `Converted Application "${app.brand_name}" into an Active Storefront Brand!`, `Brand ID: ${newBrand.id}`);
    return newBrand;
  }

  public static async deleteApplication(id: string): Promise<boolean> {
    const current = await this.getApplications();
    const app = current.find((a) => a.id === id);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('brand_applications').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete application failed:', e);
      }
    }

    const updated = current.filter((a) => a.id !== id);
    setLocal('brand_applications', updated);
    this.addLog('delete', 'application', `Deleted application "${app?.brand_name || id}"`, undefined, id);
    return true;
  }

  // FAQS
  public static async getFaqs(): Promise<FaqRow[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('faqs').select('*').order('sort_order');
        if (!error && data) {
          setLocal('faqs', data as FaqRow[]);
          return data as FaqRow[];
        }
        if (error) console.warn('Falling back to local faqs:', error.message);
      } catch (e) {
        console.warn('Falling back to local faqs:', e);
      }
    }
    return getLocal<FaqRow[]>('faqs', INITIAL_FAQS);
  }

  public static async saveFaq(faq: Partial<FaqRow>): Promise<FaqRow> {
    const isNew = !faq.id;
    const id = faq.id || 'faq-' + Date.now();
    const now = new Date().toISOString();
    const faqs = await this.getFaqs();

    const payload: FaqRow = {
      id,
      question: faq.question || 'New Question?',
      answer: faq.answer || 'Answer details...',
      category: faq.category || 'General',
      sort_order: faq.sort_order ?? faqs.length + 1,
      published: faq.published ?? true,
      created_at: faq.created_at || now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('faqs') as any).upsert(payload);
      } catch (e) {
        console.warn('Supabase upsert FAQ failed:', e);
      }
    }

    const exists = faqs.some((f) => f.id === id);
    const updated = exists ? faqs.map((f) => (f.id === id ? payload : f)) : [...faqs, payload];
    setLocal('faqs', updated);
    this.addLog(isNew ? 'create' : 'update', 'faq', `${isNew ? 'Added' : 'Updated'} FAQ "${payload.question.slice(0, 30)}..."`, undefined, id);
    return payload;
  }

  public static async deleteFaq(id: string): Promise<boolean> {
    const current = await this.getFaqs();
    const faq = current.find((f) => f.id === id);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('faqs').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete FAQ failed:', e);
      }
    }

    const updated = current.filter((f) => f.id !== id);
    setLocal('faqs', updated);
    this.addLog('delete', 'faq', `Deleted FAQ "${faq?.question.slice(0, 30) || id}..."`, undefined, id);
    return true;
  }

  // TEAM MEMBERS
  public static async getTeamMembers(): Promise<TeamMemberRow[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('team_members').select('*').order('sort_order');
        if (!error && data) {
          setLocal('team_members', data as TeamMemberRow[]);
          return data as TeamMemberRow[];
        }
      } catch (e) {
        console.warn('Falling back to local team members:', e);
      }
    }
    return getLocal<TeamMemberRow[]>('team_members', INITIAL_TEAM_MEMBERS);
  }

  public static async saveTeamMember(member: Partial<TeamMemberRow>): Promise<TeamMemberRow> {
    const isNew = !member.id;
    const id = member.id || `team-${Date.now()}`;
    const now = new Date().toISOString();
    const current = await this.getTeamMembers();
    const payload: TeamMemberRow = {
      id,
      name: member.name?.trim() || 'Team Member',
      role: member.role?.trim() || 'Team Member',
      image: member.image?.trim() || 'https://api.dicebear.com/7.x/initials/svg?seed=Team',
      bio: member.bio?.trim() || '',
      sort_order: member.sort_order ?? current.length + 1,
      published: member.published ?? true,
      created_at: member.created_at || now,
      updated_at: now,
    };
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await (supabase.from('team_members') as any).upsert(payload);
      if (error) throw new Error(`Team member save failed: ${error.message}`);
    }
    const updated = current.some((item) => item.id === id) ? current.map((item) => (item.id === id ? payload : item)) : [...current, payload];
    setLocal('team_members', updated);
    this.addLog(isNew ? 'create' : 'update', 'setting', `${isNew ? 'Added' : 'Updated'} team member "${payload.name}"`, undefined, id);
    return payload;
  }

  public static async deleteTeamMember(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw new Error(`Team member delete failed: ${error.message}`);
    }
    setLocal('team_members', (await this.getTeamMembers()).filter((item) => item.id !== id));
    this.addLog('delete', 'setting', `Deleted team member "${id}"`, undefined, id);
    return true;
  }

  // SITE SETTINGS & HOMEPAGE
  public static async getHomepageSettings(): Promise<HomepageSettings> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('site_settings').select('*').eq('key', 'homepage').maybeSingle();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawValue = (data as any)?.value;
        if (!error && rawValue) {
          const settings = { ...DEFAULT_HOMEPAGE, ...(rawValue as object) };
          setLocal('homepage_settings', settings);
          return settings;
        }
      } catch (e) {
        console.warn('Falling back to local homepage settings:', e);
      }
    }
    return getLocal<HomepageSettings>('homepage_settings', DEFAULT_HOMEPAGE);
  }

  public static async saveHomepageSettings(settings: HomepageSettings): Promise<HomepageSettings> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('site_settings') as any).upsert({
          key: 'homepage',
          value: settings as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Supabase save settings failed:', e);
      }
    }

    setLocal('homepage_settings', settings);
    this.addLog('update', 'setting', 'Updated Storefront Hero & Homepage Copy');
    return settings;
  }

  // RESET ALL TO FACTORY SAMPLE DATA
  public static resetToFactoryDefaults(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'brands');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'products');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'categories');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'reviews');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'brand_applications');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'faqs');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'homepage_settings');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'team_members');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'activity_logs');
      window.dispatchEvent(new CustomEvent('zepnex_catalog_updated', { detail: { reset: true } }));
    } catch (e) {
      console.error('Reset failed:', e);
    }
  }

  // EXPORT ALL DATA
  public static async exportAllData(): Promise<Record<string, unknown>> {
    const [brands, products, categories, reviews, applications, faqs, homepage] = await Promise.all([
      this.getBrands(),
      this.getProducts(),
      this.getCategories(),
      this.getReviews(),
      this.getApplications(),
      this.getFaqs(),
      this.getHomepageSettings(),
    ]);

    return {
      version: '1.0',
      exported_at: new Date().toISOString(),
      brands,
      products,
      categories,
      reviews,
      brand_applications: applications,
      faqs,
      homepage_settings: homepage,
    };
  }

  // IMPORT ALL DATA
  public static async importAllData(data: Record<string, unknown>): Promise<void> {
    if (Array.isArray(data.brands)) setLocal('brands', data.brands);
    if (Array.isArray(data.products)) setLocal('products', data.products);
    if (Array.isArray(data.categories)) setLocal('categories', data.categories);
    if (Array.isArray(data.reviews)) setLocal('reviews', data.reviews);
    if (Array.isArray(data.brand_applications)) setLocal('brand_applications', data.brand_applications);
    if (Array.isArray(data.faqs)) setLocal('faqs', data.faqs);
    if (data.homepage_settings) setLocal('homepage_settings', data.homepage_settings);

    this.addLog('sync', 'database', 'Imported marketplace catalog backup file');
  }
}
