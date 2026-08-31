'use client';

import { createClient } from './client';
import { isSupabaseConfigured } from './config';
import { DataService } from './data-service';
import { brands as sampleBrands } from '@/data/brands';
import { products as sampleProducts } from '@/data/products';
import { DEFAULT_HOMEPAGE, type SyncStepResult } from '@/types/database';

export interface DatabaseStats {
  connected: boolean;
  isFallback: boolean;
  counts: {
    brands: { supabase: number; local: number };
    products: { supabase: number; local: number };
    categories: { supabase: number; local: number };
    reviews: { supabase: number; local: number };
    applications: { supabase: number; local: number };
    faqs: { supabase: number; local: number };
  };
  supabaseUrl?: string;
}

export class SyncEngine {
  public static async getStats(): Promise<DatabaseStats> {
    const [localBrands, localProducts, localCats, localRevs, localApps, localFaqs] = await Promise.all([
      DataService.getBrands(),
      DataService.getProducts(),
      DataService.getCategories(),
      DataService.getReviews(),
      DataService.getApplications(),
      DataService.getFaqs(),
    ]);

    const stats: DatabaseStats = {
      connected: false,
      isFallback: true,
      counts: {
        brands: { supabase: 0, local: localBrands.length },
        products: { supabase: 0, local: localProducts.length },
        categories: { supabase: 0, local: localCats.length },
        reviews: { supabase: 0, local: localRevs.length },
        applications: { supabase: 0, local: localApps.length },
        faqs: { supabase: 0, local: localFaqs.length },
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
    };

    if (!isSupabaseConfigured()) {
      return stats;
    }

    try {
      const supabase = createClient();
      const [b, p, c, r, a, f] = await Promise.all([
        supabase.from('brands').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('brand_applications').select('id', { count: 'exact', head: true }),
        supabase.from('faqs').select('id', { count: 'exact', head: true }),
      ]);

      stats.connected = !b.error && !p.error;
      stats.isFallback = !stats.connected;
      stats.counts.brands.supabase = b.count || 0;
      stats.counts.products.supabase = p.count || 0;
      stats.counts.categories.supabase = c.count || 0;
      stats.counts.reviews.supabase = r.count || 0;
      stats.counts.applications.supabase = a.count || 0;
      stats.counts.faqs.supabase = f.count || 0;
    } catch {
      stats.connected = false;
      stats.isFallback = true;
    }

    return stats;
  }

  public static async pushSampleDataToSupabase(
    onProgress: (step: SyncStepResult) => void
  ): Promise<{ success: boolean; message: string; steps: SyncStepResult[] }> {
    const steps: SyncStepResult[] = [];
    const recordStep = (step: SyncStepResult) => {
      steps.push(step);
      onProgress(step);
    };

    if (!isSupabaseConfigured()) {
      recordStep({
        step: 'Supabase Configuration Check',
        status: 'error',
        message: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.',
      });
      return { success: false, message: 'Supabase credentials not configured in .env', steps };
    }

    const supabase = createClient();

    try {
      // 1. Categories
      recordStep({ step: '1. Syncing Categories', status: 'running' });
      const categories = [
        { id: 'clothing', name: 'Clothing', sort_order: 1, published: true },
        { id: 'daily-use', name: 'Daily Use', sort_order: 2, published: true },
        { id: 'electronics', name: 'Electronics', sort_order: 3, published: true },
        { id: 'home-living', name: 'Home & Living', sort_order: 4, published: true },
        { id: 'beauty', name: 'Beauty', sort_order: 5, published: true },
        { id: 'sports', name: 'Sports', sort_order: 6, published: true },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: catErr } = await (supabase.from('categories') as any).upsert(categories, { onConflict: 'id' });
      if (catErr) throw new Error(`Categories sync failed: ${catErr.message}`);
      recordStep({ step: '1. Syncing Categories', status: 'success', count: categories.length, message: '6 categories synchronized' });

      // 2. Brands
      recordStep({ step: '2. Syncing Brands', status: 'running' });
      const brandsPayload = sampleBrands.map((b) => ({
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
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: brandErr } = await (supabase.from('brands') as any).upsert(brandsPayload, { onConflict: 'id' });
      if (brandErr) throw new Error(`Brands sync failed: ${brandErr.message}`);
      recordStep({ step: '2. Syncing Brands', status: 'success', count: brandsPayload.length, message: `${brandsPayload.length} brands synchronized` });

      // 3. Products
      recordStep({ step: '3. Syncing Products', status: 'running' });
      const productsPayload = sampleProducts.map((p) => ({
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
        badge: p.badge || null,
        featured: Boolean(p.badge === 'Sale' || p.badge === 'Best Seller'),
        published: true,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: prodErr } = await (supabase.from('products') as any).upsert(productsPayload, { onConflict: 'id' });
      if (prodErr) throw new Error(`Products sync failed: ${prodErr.message}`);
      recordStep({ step: '3. Syncing Products', status: 'success', count: productsPayload.length, message: `${productsPayload.length} products synchronized` });

      // 4. Reviews & Testimonials
      recordStep({ step: '4. Syncing Reviews & Testimonials', status: 'running' });
      const reviewsPayload = [
        {
          id: 'rev-1',
          kind: 'homepage' as const,
          brand_id: null,
          author: 'Ananya Mehta',
          role: 'Mumbai',
          rating: 5,
          comment: 'Found unique brands I never would have discovered otherwise. Quality is consistently excellent.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
          published: true,
        },
        {
          id: 'rev-2',
          kind: 'homepage' as const,
          brand_id: null,
          author: 'Rahul Iyer',
          role: 'Bengaluru',
          rating: 5,
          comment: 'Prices are fair and the curated brands feel premium without the usual marketplace chaos.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
          published: true,
        },
        {
          id: 'rev-3',
          kind: 'homepage' as const,
          brand_id: null,
          author: 'Sana Qureshi',
          role: 'Delhi',
          rating: 4,
          comment: 'Love shopping from small Indian labels in one place. Delivery and packaging were solid.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sana',
          published: true,
        },
        {
          id: 'rev-4',
          kind: 'brand' as const,
          brand_id: 'brand-1',
          author: 'Rahul Kumar',
          role: 'Verified Buyer',
          rating: 5,
          comment: 'Excellent quality products and fast delivery. Highly recommended!',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulK',
          published: true,
        },
        {
          id: 'rev-5',
          kind: 'brand' as const,
          brand_id: 'brand-1',
          author: 'Priya Singh',
          role: 'Verified Buyer',
          rating: 4,
          comment: 'Good products but could improve on packaging.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaS',
          published: true,
        },
        {
          id: 'rev-6',
          kind: 'brand' as const,
          brand_id: 'brand-3',
          author: 'Amit Patel',
          role: 'Verified Buyer',
          rating: 5,
          comment: 'Amazing experience! Will definitely order again.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AmitP',
          published: true,
        },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: revErr } = await (supabase.from('reviews') as any).upsert(reviewsPayload, { onConflict: 'id' });
      if (revErr) throw new Error(`Reviews sync failed: ${revErr.message}`);
      recordStep({ step: '4. Syncing Reviews & Testimonials', status: 'success', count: reviewsPayload.length, message: `${reviewsPayload.length} reviews synchronized` });

      // 5. FAQs
      recordStep({ step: '5. Syncing FAQs', status: 'running' });
      const faqsPayload = [
        {
          id: 'faq-1',
          question: 'What are the eligibility requirements?',
          answer: 'Your brand should have at least 6 months of operation with genuine products and good customer reviews.',
          sort_order: 1,
          published: true,
        },
        {
          id: 'faq-2',
          question: 'How long does approval take?',
          answer: 'Most applications are approved within 24-48 hours. We will notify you via email about the status.',
          sort_order: 2,
          published: true,
        },
        {
          id: 'faq-3',
          question: 'Can I list multiple product categories?',
          answer: 'Yes! You can list products from different categories. We support multiple categories per brand.',
          sort_order: 3,
          published: true,
        },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: faqErr } = await (supabase.from('faqs') as any).upsert(faqsPayload, { onConflict: 'id' });
      if (faqErr) throw new Error(`FAQs sync failed: ${faqErr.message}`);
      recordStep({ step: '5. Syncing FAQs', status: 'success', count: faqsPayload.length, message: `${faqsPayload.length} FAQs synchronized` });

      // 6. Site Settings
      recordStep({ step: '6. Syncing Site Settings', status: 'running' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: setErr } = await (supabase.from('site_settings') as any).upsert({
        key: 'homepage',
        value: DEFAULT_HOMEPAGE as unknown as Record<string, unknown>,
      });
      if (setErr) throw new Error(`Site Settings sync failed: ${setErr.message}`);
      recordStep({ step: '6. Syncing Site Settings', status: 'success', count: 1, message: 'Homepage & branding settings synchronized' });

      DataService.addLog('sync', 'database', 'All Sample Data successfully pushed to Supabase PostgreSQL!');

      return {
        success: true,
        message: 'Successfully synchronized all 6 categories, 6 brands, 18 products, 6 reviews, 3 FAQs, and Homepage settings to Supabase!',
        steps,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown sync error occurred';
      recordStep({ step: 'Sync Process', status: 'error', message: msg });
      return { success: false, message: msg, steps };
    }
  }

  public static async pullSupabaseToLocal(
    onProgress: (step: SyncStepResult) => void
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const supabase = createClient();
      onProgress({ step: 'Fetching data from Supabase...', status: 'running' });

      const [b, p, c, r, f, s] = await Promise.all([
        supabase.from('brands').select('*'),
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('reviews').select('*'),
        supabase.from('faqs').select('*'),
        supabase.from('site_settings').select('*').eq('key', 'homepage').maybeSingle(),
      ]);

      if (b.data && b.data.length > 0) DataService.saveBrand(b.data[0]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const homeVal = (s.data as any)?.value || DEFAULT_HOMEPAGE;

      await DataService.importAllData({
        brands: b.data || [],
        products: p.data || [],
        categories: c.data || [],
        reviews: r.data || [],
        faqs: f.data || [],
        homepage_settings: homeVal,
      });

      onProgress({ step: 'Supabase Data Pulled', status: 'success', message: 'Local cache updated with live Supabase database records.' });
      return { success: true, message: 'Local cache synchronized from Supabase!' };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Failed to pull data' };
    }
  }
}
