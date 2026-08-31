'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Sparkles,
  Percent,
  Plus,
  Trash2,
  Check,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Field, PageHeader, inputClass } from '@/components/admin/AdminShell';
import ImageField from '@/components/admin/ImageField';
import { useToast } from '@/components/admin/ToastContext';
import { DataService } from '@/lib/supabase/data-service';
import type { BrandRow, CategoryRow, ProductRow } from '@/types/database';

const empty: Partial<ProductRow> = {
  name: '',
  brand_id: '',
  category: 'Clothing',
  price: 0,
  original_price: null,
  rating: 4.8,
  reviews: 12,
  image: '',
  images: [],
  description: '',
  in_stock: true,
  stock_quantity: 45,
  badge: '',
  featured: false,
  published: true,
};

const PRESET_BADGES = ['Sale', 'New', 'Best Seller', 'Trending', 'Limited Edition', 'Staff Pick'];

export default function ProductEditor({
  initial,
  isNew,
}: {
  initial?: ProductRow;
  isNew?: boolean;
}) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<Partial<ProductRow>>(initial || empty);
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [galleryInput, setGalleryInput] = useState((initial?.images || []).join('\n'));
  const [busy, setBusy] = useState(false);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    Promise.all([DataService.getBrands(), DataService.getCategories()]).then(([b, c]) => {
      setBrands(b);
      setCategories(c);
      if (isNew && b.length > 0 && !form.brand_id) {
        setForm((prev) => ({ ...prev, brand_id: b[0].id, brand_name: b[0].name }));
      }
    });
  }, [isNew, form.brand_id]);

  const set = (key: keyof ProductRow, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Auto discount percentage calculation
  const discountPercent =
    form.original_price && form.price && form.original_price > form.price
      ? Math.round(((form.original_price - form.price) / form.original_price) * 100)
      : null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const galleryImages = galleryInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const assignedBrand = brands.find((b) => b.id === form.brand_id);

      const saved = await DataService.saveProduct({
        ...form,
        brand_name: assignedBrand?.name || form.brand_name || 'Brand',
        images: galleryImages,
      });

      success(isNew ? 'Product Created!' : 'Product Updated!', `Saved "${saved.name}" to catalog.`);
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      toastError('Save Error', err instanceof Error ? err.message : 'Failed to save product');
      setBusy(false);
    }
  };

  const galleryList = galleryInput
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <form onSubmit={save} className="max-w-5xl space-y-6">
      <PageHeader
        title={isNew ? 'Add New Product' : `Edit: ${form.name || 'Product'}`}
        subtitle="Configure pricing, stock, category tags, badges, and image galleries."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: isNew ? 'New' : form.name || 'Edit' },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-sm text-xs font-semibold hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Link>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{busy ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        }
      />

      {/* Main Grid Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details Card */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span>Product Information</span>
            </h3>

            <Field label="Product Name" required>
              <input
                required
                className={inputClass}
                placeholder="e.g. Classic Organic Cotton Crewneck"
                value={form.name || ''}
                onChange={(e) => set('name', e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Brand Assignment" required>
                <select
                  className={inputClass}
                  value={form.brand_id || ''}
                  onChange={(e) => {
                    const brand = brands.find((b) => b.id === e.target.value);
                    set('brand_id', e.target.value);
                    if (brand) set('brand_name', brand.name);
                  }}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Category" required>
                <select
                  className={inputClass}
                  value={form.category || 'Clothing'}
                  onChange={(e) => set('category', e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-32 leading-relaxed`}
                placeholder="Detailed description, fabric/material details, fit guidance, and warranty..."
                value={form.description || ''}
                onChange={(e) => set('description', e.target.value)}
              />
            </Field>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3 flex items-center gap-2">
              <Percent className="w-4 h-4 text-primary" />
              <span>Pricing & Inventory</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Price (INR ₹)" required>
                <input
                  type="number"
                  required
                  min={0}
                  className={inputClass}
                  value={form.price ?? 0}
                  onChange={(e) => set('price', Number(e.target.value))}
                />
              </Field>

              <Field label="Original / MRP Price (₹)" hint="Used to display discount strike-through">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="e.g. 1999"
                  value={form.original_price ?? ''}
                  onChange={(e) => set('original_price', e.target.value ? Number(e.target.value) : null)}
                />
              </Field>

              <Field label="Calculated Discount">
                <div className="px-3.5 py-2.5 bg-secondary/60 border border-border rounded-sm text-sm font-semibold text-emerald-700 flex items-center justify-between">
                  <span>{discountPercent ? `${discountPercent}% OFF` : 'No Discount'}</span>
                  {discountPercent && <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Active</span>}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Field label="Stock Quantity Units">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.stock_quantity ?? (form.in_stock ? 45 : 0)}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    set('stock_quantity', q);
                    if (q > 0) set('in_stock', true);
                    else set('in_stock', false);
                  }}
                />
              </Field>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2.5 p-2.5 bg-secondary/30 rounded border border-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.in_stock)}
                    onChange={(e) => set('in_stock', e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold block">In Stock & Available to Order</span>
                    <span className="text-[10px] text-muted-foreground">Uncheck to mark as Sold Out on storefront</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Media & Gallery Card */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span>Media & Gallery</span>
            </h3>

            <ImageField
              label="Primary Cover Image"
              value={form.image || ''}
              onChange={(url) => set('image', url)}
              folder="products"
              hint="Main listing image shown on catalog grids"
            />

            <Field label="Gallery Image URLs (One URL per line)" hint="Additional high-resolution product photos shown on the product detail page">
              <textarea
                className={`${inputClass} min-h-24 font-mono text-xs`}
                placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
              />
            </Field>

            {galleryList.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gallery Preview ({galleryList.length} images)</p>
                <div className="flex flex-wrap gap-2">
                  {galleryList.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded border border-border bg-secondary overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Gallery item ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Badges, Status & Live Preview Card */}
        <div className="space-y-6">
          {/* Status & Visibility Card */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3">Listing Visibility</h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 bg-secondary/20 rounded border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold block">Published</span>
                  <span className="text-[10px] text-muted-foreground">Visible on public marketplace</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.published)}
                  onChange={(e) => set('published', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-secondary/20 rounded border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold block">Featured on Home</span>
                  <span className="text-[10px] text-muted-foreground">Spotlight in curated carousels</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(e) => set('featured', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Badges & Tags */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Promotional Badge</span>
            </h3>

            <Field label="Custom Badge Text">
              <input
                className={inputClass}
                placeholder="e.g. Best Seller, Sale, 40% OFF"
                value={form.badge || ''}
                onChange={(e) => set('badge', e.target.value)}
              />
            </Field>

            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground font-semibold">Quick Presets:</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_BADGES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set('badge', form.badge === b ? '' : b)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded transition-colors ${
                      form.badge === b
                        ? 'bg-primary text-white'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ratings & Social Proof */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3">Social Proof</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating Score">
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  className={inputClass}
                  value={form.rating ?? 4.8}
                  onChange={(e) => set('rating', Number(e.target.value))}
                />
              </Field>

              <Field label="Review Count">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.reviews ?? 0}
                  onChange={(e) => set('reviews', Number(e.target.value))}
                />
              </Field>
            </div>
          </div>

          {/* Live Card Preview */}
          <div className="bg-card border border-border p-4 rounded-md space-y-3 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Storefront Card Preview</p>
            <div className="border border-border rounded overflow-hidden bg-background">
              <div className="aspect-square bg-secondary relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=preview&scale=80'}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                {form.badge && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-xs shadow-sm">
                    {form.badge}
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{form.brand_name || 'Brand'}</p>
                <p className="text-xs font-semibold truncate">{form.name || 'Product Title'}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-display font-bold text-sm">₹{form.price || 0}</span>
                  {form.original_price && (
                    <span className="text-xs text-muted-foreground line-through">₹{form.original_price}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
