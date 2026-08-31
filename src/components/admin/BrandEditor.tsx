'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  Check,
  ArrowLeft,
  Sparkles,
  BadgeCheck,
  Globe,
  Mail,
  MapPin,
  Users,
} from 'lucide-react';
import { Field, PageHeader, inputClass } from '@/components/admin/AdminShell';
import ImageField from '@/components/admin/ImageField';
import { useToast } from '@/components/admin/ToastContext';
import { DataService } from '@/lib/supabase/data-service';
import type { BrandRow } from '@/types/database';

const empty: Partial<BrandRow> = {
  name: '',
  tagline: '',
  logo: '',
  cover_image: '',
  location: 'Mumbai, India',
  rating: 4.8,
  reviews: 140,
  followers: 3200,
  product_count: 12,
  description: '',
  verified: true,
  website: 'https://example.com',
  contact_email: '',
  featured: true,
  published: true,
};

export default function BrandEditor({
  initial,
  isNew,
}: {
  initial?: BrandRow;
  isNew?: boolean;
}) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<Partial<BrandRow>>(initial || empty);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof BrandRow, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = await DataService.saveBrand(form);
      success(isNew ? 'Brand Created!' : 'Brand Updated!', `Saved "${saved.name}" to brand directory.`);
      router.push('/admin/brands');
      router.refresh();
    } catch (err) {
      toastError('Save Error', err instanceof Error ? err.message : 'Failed to save brand');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-5xl space-y-6">
      <PageHeader
        title={isNew ? 'Add Partner Brand' : `Edit: ${form.name || 'Brand'}`}
        subtitle="Manage brand identity, merchant credentials, cover graphics, and marketplace verification."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Brands', href: '/admin/brands' },
          { label: isNew ? 'New' : form.name || 'Edit' },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/brands"
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
              <span>{busy ? 'Saving...' : 'Save Brand'}</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Card */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <span>Brand Identity & Story</span>
            </h3>

            <Field label="Brand Name" required>
              <input
                required
                className={inputClass}
                placeholder="e.g. TrendStyle Co."
                value={form.name || ''}
                onChange={(e) => set('name', e.target.value)}
              />
            </Field>

            <Field label="Tagline / Short Hook">
              <input
                className={inputClass}
                placeholder="e.g. Premium Handcrafted Fashion for Everyone"
                value={form.tagline || ''}
                onChange={(e) => set('tagline', e.target.value)}
              />
            </Field>

            <Field label="Brand Story & Background">
              <textarea
                className={`${inputClass} min-h-32 leading-relaxed`}
                placeholder="The inspiration, founders, craft process, sustainability principles, and catalog philosophy..."
                value={form.description || ''}
                onChange={(e) => set('description', e.target.value)}
              />
            </Field>
          </div>

          {/* Location & Contact Card */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Contact & Merchant Presence</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Location / City HQ">
                <input
                  className={inputClass}
                  placeholder="e.g. Mumbai, India"
                  value={form.location || ''}
                  onChange={(e) => set('location', e.target.value)}
                />
              </Field>

              <Field label="Official Website">
                <input
                  className={inputClass}
                  placeholder="https://brandwebsite.com"
                  value={form.website || ''}
                  onChange={(e) => set('website', e.target.value)}
                />
              </Field>
            </div>

            <Field label="Merchant Contact Email">
              <input
                type="email"
                className={inputClass}
                placeholder="contact@brand.com"
                value={form.contact_email || ''}
                onChange={(e) => set('contact_email', e.target.value)}
              />
            </Field>
          </div>

          {/* Media & Artwork */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3">Brand Artwork & Logos</h3>

            <ImageField
              label="Brand Logo"
              value={form.logo || ''}
              onChange={(url) => set('logo', url)}
              folder="logos"
              hint="Square brand icon or avatar"
            />

            <ImageField
              label="Cover Hero Banner"
              value={form.cover_image || ''}
              onChange={(url) => set('cover_image', url)}
              folder="covers"
              hint="Wide banner shown at the top of the brand storefront page"
            />
          </div>
        </div>

        {/* Right 1 Col: Status & Preview */}
        <div className="space-y-6">
          {/* Verification & Visibility */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3">Verification & Status</h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 bg-secondary/20 rounded border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-primary" /> Verified Label
                  </span>
                  <span className="text-[10px] text-muted-foreground">Display verified blue tick on storefront</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.verified)}
                  onChange={(e) => set('verified', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-secondary/20 rounded border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Featured Brand
                  </span>
                  <span className="text-[10px] text-muted-foreground">Show in Homepage featured brand slider</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(e) => set('featured', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-secondary/20 rounded border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold block">Published</span>
                  <span className="text-[10px] text-muted-foreground">Live & browseable to customers</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.published)}
                  onChange={(e) => set('published', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Social Proof & Metrics */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3">Metrics & Reputation</h3>

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

              <Field label="Followers">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.followers ?? 0}
                  onChange={(e) => set('followers', Number(e.target.value))}
                />
              </Field>

              <Field label="Product Count">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.product_count ?? 0}
                  onChange={(e) => set('product_count', Number(e.target.value))}
                />
              </Field>
            </div>
          </div>

          {/* Live Card Preview */}
          <div className="bg-card border border-border p-4 rounded-md space-y-3 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand Header Preview</p>
            <div className="border border-border rounded overflow-hidden bg-background">
              <div className="h-20 bg-secondary relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.cover_image || 'https://img.rocket.new/generatedImages/rocket_gen_img_2bc4c88d8-1773225914256.png'} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-3 pt-0 relative">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-card overflow-hidden -mt-6 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${form.name || 'B'}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1.5">
                    <p className="font-display font-bold text-sm truncate">{form.name || 'Brand Name'}</p>
                    {form.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{form.tagline || 'Brand Tagline'}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                    <span>⭐ {form.rating}</span>
                    <span>{form.followers} followers</span>
                    <span>{form.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
