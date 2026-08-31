'use client';

import React, { useState, useEffect } from 'react';
import {
  PanelsTopLeft,
  Check,
  Eye,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Store,
  Megaphone,
} from 'lucide-react';
import { PageHeader, Field, inputClass } from '@/components/admin/AdminShell';
import ImageField from '@/components/admin/ImageField';
import { useToast } from '@/components/admin/ToastContext';
import { DataService } from '@/lib/supabase/data-service';
import { DEFAULT_HOMEPAGE, type HomepageSettings } from '@/types/database';

export default function AdminContentPage() {
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<HomepageSettings>(DEFAULT_HOMEPAGE);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    DataService.getHomepageSettings().then((data) => {
      if (data) setForm({ ...DEFAULT_HOMEPAGE, ...data });
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await DataService.saveHomepageSettings(form);
      success('Storefront Updated!', 'Homepage hero copy and branding synchronized to storefront.');
    } catch {
      toastError('Save Error', 'Failed to update homepage settings');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Homepage Hero & Storefront Content"
        subtitle="Live customizable hero copy, announcement banners, call-to-actions, and featured imagery."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Storefront Content' }]}
        action={
          <button
            onClick={save}
            disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>{busy ? 'Saving...' : 'Save & Publish to Storefront'}</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Editor Controls */}
        <form onSubmit={save} className="space-y-5">
          {/* Announcement Bar Settings */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              <span>Top Announcement Ticker Bar</span>
            </h3>

            <label className="flex items-center justify-between p-2.5 bg-secondary/20 rounded border border-border cursor-pointer">
              <div>
                <span className="text-xs font-semibold block">Enable Announcement Bar</span>
                <span className="text-[10px] text-muted-foreground">Show marquee at the very top of all pages</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(form.announcementBar?.enabled)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    announcementBar: {
                      enabled: e.target.checked,
                      text: form.announcementBar?.text || '🎉 Welcome to ZEPNEX! Explore 500+ curated artisan brands.',
                      linkText: form.announcementBar?.linkText || 'Explore Now',
                      linkUrl: form.announcementBar?.linkUrl || '/products',
                    },
                  })
                }
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
            </label>

            {form.announcementBar?.enabled && (
              <div className="space-y-3 pt-2">
                <Field label="Banner Text">
                  <input
                    className={inputClass}
                    value={form.announcementBar?.text || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        announcementBar: { ...form.announcementBar!, text: e.target.value },
                      })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="CTA Link Text">
                    <input
                      className={inputClass}
                      value={form.announcementBar?.linkText || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          announcementBar: { ...form.announcementBar!, linkText: e.target.value },
                        })
                      }
                    />
                  </Field>
                  <Field label="Destination URL">
                    <input
                      className={inputClass}
                      value={form.announcementBar?.linkUrl || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          announcementBar: { ...form.announcementBar!, linkUrl: e.target.value },
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* Hero Section Copy */}
          <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm border-b border-border pb-3 flex items-center gap-2">
              <PanelsTopLeft className="w-4 h-4 text-primary" />
              <span>Hero Copy & Headlines</span>
            </h3>

            <Field label="Eyebrow Tagline">
              <input
                className={inputClass}
                value={form.eyebrow}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
              />
            </Field>

            <Field label="Main Title (First Line)">
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>

            <Field label="Highlighted Title (Gold Italicized)">
              <input
                className={inputClass}
                value={form.highlight}
                onChange={(e) => setForm({ ...form, highlight: e.target.value })}
              />
            </Field>

            <Field label="Subtitle Description">
              <textarea
                className={`${inputClass} min-h-24 leading-relaxed`}
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Primary CTA Button Text">
                <input
                  className={inputClass}
                  value={form.ctaPrimary}
                  onChange={(e) => setForm({ ...form, ctaPrimary: e.target.value })}
                />
              </Field>

              <Field label="Secondary CTA Button Text">
                <input
                  className={inputClass}
                  value={form.ctaSecondary}
                  onChange={(e) => setForm({ ...form, ctaSecondary: e.target.value })}
                />
              </Field>
            </div>

            <ImageField
              label="Hero Spotlight Imagery"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="hero"
              hint="High resolution featured visual shown on the right of the homepage hero"
            />
          </div>
        </form>

        {/* Right Col: Live Storefront Split Preview */}
        <div className="space-y-4 sticky top-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" /> Live Storefront Preview
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 font-semibold">
              Interactive
            </span>
          </div>

          <div className="bg-[#FAF8F3] border border-border rounded-lg shadow-xl overflow-hidden text-foreground">
            {/* Top Bar Preview */}
            {form.announcementBar?.enabled && (
              <div className="bg-[#1C1A16] text-white py-2 px-3 text-center text-[10px] flex items-center justify-center gap-2">
                <span>{form.announcementBar.text}</span>
                {form.announcementBar.linkText && (
                  <span className="text-primary font-semibold underline">{form.announcementBar.linkText}</span>
                )}
              </div>
            )}

            {/* Fake Storefront Nav */}
            <div className="px-5 py-3 border-b border-border/60 bg-white/70 backdrop-blur-xs flex items-center justify-between text-xs">
              <span className="font-display font-bold tracking-wider text-sm">ZEPNEX</span>
              <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
                <span>Brands</span>
                <span>Products</span>
                <span>Join as Brand</span>
              </div>
            </div>

            {/* Hero Section Live Render */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-primary">
                  {form.eyebrow || 'TAGLINE'}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  {form.title || 'Main Title'}{' '}
                  <span className="text-primary italic font-normal">{form.highlight}</span>
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {form.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm shadow-sm flex items-center gap-1">
                  <span>{form.ctaPrimary || 'Shop Products'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button className="px-4 py-2 border border-border bg-card text-xs font-semibold rounded-sm">
                  {form.ctaSecondary || 'Explore Brands'}
                </button>
              </div>

              {/* Hero Image Showcase */}
              <div className="aspect-video rounded-md overflow-hidden border border-border bg-secondary shadow-md relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt="Hero banner preview" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
