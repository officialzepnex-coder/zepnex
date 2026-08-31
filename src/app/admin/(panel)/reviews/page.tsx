'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MessageSquareText,
  Star,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Store,
  Package,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader, Field, inputClass } from '@/components/admin/AdminShell';
import { useToast } from '@/components/admin/ToastContext';
import { DataService } from '@/lib/supabase/data-service';
import type { ReviewRow, BrandRow, ProductRow } from '@/types/database';

const emptyReview: Partial<ReviewRow> = {
  kind: 'homepage',
  brand_id: null,
  product_id: null,
  author: '',
  role: 'Verified Buyer',
  rating: 5,
  comment: '',
  avatar: '',
  published: true,
};

export default function AdminReviewsPage() {
  const { success, error: toastError } = useToast();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'homepage' | 'brand' | 'product'>('all');
  const [form, setForm] = useState<Partial<ReviewRow>>(emptyReview);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [r, b, p] = await Promise.all([
        DataService.getReviews(),
        DataService.getBrands(),
        DataService.getProducts(),
      ]);
      setReviews(r);
      setBrands(b);
      setProducts(p);
    } catch {
      toastError('Failed to load reviews');
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('zepnex_catalog_updated', handleUpdate);
    return () => window.removeEventListener('zepnex_catalog_updated', handleUpdate);
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author || !form.comment) return;
    setBusy(true);
    try {
      const saved = await DataService.saveReview({
        ...form,
        id: editingId || undefined,
      });
      success(editingId ? 'Review Updated' : 'Review Added', `Saved review from "${saved.author}".`);
      setForm(emptyReview);
      setEditingId(null);
      loadData();
    } catch {
      toastError('Failed to save review');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (rev: ReviewRow) => {
    setEditingId(rev.id);
    setForm(rev);
  };

  const handleDelete = async (id: string, author: string) => {
    if (!confirm(`Delete review from "${author}"?`)) return;
    try {
      await DataService.deleteReview(id);
      success('Review Deleted', `Removed review from "${author}".`);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyReview);
      }
      loadData();
    } catch {
      toastError('Delete Failed');
    }
  };

  const handleTogglePublished = async (rev: ReviewRow) => {
    try {
      await DataService.saveReview({ ...rev, published: !rev.published });
      success('Approval Updated', `Review is now ${!rev.published ? 'Approved & Live' : 'Hidden'}.`);
      loadData();
    } catch {
      toastError('Update Failed');
    }
  };

  const filteredReviews = useMemo(() => {
    if (activeTab === 'all') return reviews;
    return reviews.filter((r) => r.kind === activeTab);
  }, [reviews, activeTab]);

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Customer Reviews & Testimonials"
        subtitle="Manage customer ratings, social proof testimonials for the homepage hero, and verified buyer feedback."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Reviews' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tabs & Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-border bg-card p-1.5 rounded-md">
            {[
              { key: 'all', label: 'All Reviews', count: reviews.length },
              { key: 'homepage', label: 'Homepage Testimonials', count: reviews.filter((r) => r.kind === 'homepage').length },
              { key: 'brand', label: 'Brand Reviews', count: reviews.filter((r) => r.kind === 'brand').length },
              { key: 'product', label: 'Product Reviews', count: reviews.filter((r) => r.kind === 'product').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="bg-card border border-border p-12 rounded-md text-center text-xs text-muted-foreground">
                No reviews found in this category. Use the form to create one.
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const brand = brands.find((b) => b.id === rev.brand_id);
                const product = products.find((p) => p.id === rev.product_id);

                return (
                  <div
                    key={rev.id}
                    className="bg-card border border-border p-4 rounded-md space-y-3 hover:border-primary/40 transition-colors shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0 border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={rev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.author}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground">{rev.author}</p>
                            {rev.role && (
                              <span className="text-[10px] text-muted-foreground px-1.5 py-0.2 rounded bg-secondary">
                                {rev.role}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs mt-0.5">
                            <div className="flex items-center text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              · {rev.kind}
                              {brand ? ` (${brand.name})` : ''}
                              {product ? ` (${product.name})` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublished(rev)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-colors ${
                            rev.published
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-700'
                          }`}
                        >
                          {rev.published ? 'Approved' : 'Pending Approval'}
                        </button>
                        <button
                          onClick={() => handleEdit(rev)}
                          className="p-1.5 rounded hover:bg-secondary text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id, rev.author)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/85 leading-relaxed bg-secondary/20 p-3 rounded border border-border/50 italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Create / Edit Form */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4 h-fit shadow-xs sticky top-24">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{editingId ? 'Edit Review' : 'Add New Review / Testimonial'}</span>
            </h3>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyReview);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <Field label="Review Kind / Scope" required>
              <select
                className={inputClass}
                value={form.kind || 'homepage'}
                onChange={(e) => setForm({ ...form, kind: e.target.value as ReviewRow['kind'] })}
              >
                <option value="homepage">Homepage Testimonial (Featured Carousel)</option>
                <option value="brand">Brand Partner Review</option>
                <option value="product">Product Review</option>
              </select>
            </Field>

            {form.kind === 'brand' && (
              <Field label="Assign Brand" required>
                <select
                  className={inputClass}
                  value={form.brand_id || ''}
                  onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {form.kind === 'product' && (
              <Field label="Assign Product" required>
                <select
                  className={inputClass}
                  value={form.product_id || ''}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Author Name" required>
              <input
                required
                className={inputClass}
                placeholder="e.g. Priya Sharma"
                value={form.author || ''}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </Field>

            <Field label="Role / Location / Tag">
              <input
                className={inputClass}
                placeholder="e.g. Mumbai · Verified Buyer"
                value={form.role || ''}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </Field>

            {/* Clickable Star Rating Picker */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating Score (1-5 Stars)</span>
              <div className="flex items-center gap-1 p-2 bg-secondary/30 rounded border border-border">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= (form.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold ml-2 text-foreground">{form.rating || 5} Stars</span>
              </div>
            </div>

            <Field label="Customer Comment / Feedback" required>
              <textarea
                required
                className={`${inputClass} min-h-24`}
                placeholder="Review text and customer impressions..."
                value={form.comment || ''}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />
            </Field>

            <Field label="Avatar Image URL (Optional)">
              <input
                className={inputClass}
                placeholder="https://api.dicebear.com/..."
                value={form.avatar || ''}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              />
            </Field>

            <label className="flex items-center gap-2 p-2 rounded bg-secondary/30 border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.published)}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-xs font-semibold">Approved & Published on Storefront</span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
            >
              {busy ? 'Saving...' : editingId ? 'Update Review' : 'Save Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
