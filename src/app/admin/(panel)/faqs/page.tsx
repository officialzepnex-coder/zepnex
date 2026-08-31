'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HelpCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Check,
  Folder,
} from 'lucide-react';
import { PageHeader, Field, inputClass } from '@/components/admin/AdminShell';
import { useToast } from '@/components/admin/ToastContext';
import { DataService } from '@/lib/supabase/data-service';
import type { FaqRow } from '@/types/database';

const emptyFaq: Partial<FaqRow> = {
  question: '',
  answer: '',
  category: 'Brand Onboarding',
  sort_order: 0,
  published: true,
};

const FAQ_CATEGORIES = ['Brand Onboarding', 'Customer Support', 'Payments & Payouts', 'Catalog & Listing', 'Shipping & Delivery'];

export default function AdminFaqsPage() {
  const { success, error: toastError } = useToast();
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [form, setForm] = useState<Partial<FaqRow>>(emptyFaq);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await DataService.getFaqs();
      setFaqs(data.sort((a, b) => a.sort_order - b.sort_order));
    } catch {
      toastError('Failed to load FAQs');
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
    if (!form.question || !form.answer) return;
    setBusy(true);
    try {
      const saved = await DataService.saveFaq({
        ...form,
        id: editingId || undefined,
        sort_order: form.sort_order || faqs.length + 1,
      });
      success(editingId ? 'FAQ Updated' : 'FAQ Added', `Saved "${saved.question.slice(0, 30)}...".`);
      setForm(emptyFaq);
      setEditingId(null);
      loadData();
    } catch {
      toastError('Failed to save FAQ');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (faq: FaqRow) => {
    setEditingId(faq.id);
    setForm(faq);
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Delete FAQ "${question.slice(0, 30)}..."?`)) return;
    try {
      await DataService.deleteFaq(id);
      success('FAQ Deleted', 'Removed article from help center.');
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyFaq);
      }
      loadData();
    } catch {
      toastError('Delete Failed');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const current = faqs[index];
    const target = faqs[targetIndex];

    try {
      await Promise.all([
        DataService.saveFaq({ ...current, sort_order: target.sort_order }),
        DataService.saveFaq({ ...target, sort_order: current.sort_order }),
      ]);
      loadData();
    } catch {
      toastError('Failed to reorder');
    }
  };

  const handleTogglePublished = async (faq: FaqRow) => {
    try {
      await DataService.saveFaq({ ...faq, published: !faq.published });
      success('Visibility Updated', `FAQ is now ${!faq.published ? 'Live' : 'Hidden'}.`);
      loadData();
    } catch {
      toastError('Update Failed');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="FAQs & Knowledge Base"
        subtitle="Manage frequently asked questions displayed on the Join as Brand page and customer support portals."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'FAQs' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Reorderable FAQs List */}
        <div className="lg:col-span-2 space-y-3">
          {faqs.length === 0 ? (
            <div className="bg-card border border-border p-12 rounded-md text-center text-xs text-muted-foreground">
              No FAQs available. Create your first FAQ using the form.
            </div>
          ) : (
            faqs.map((faq, idx) => (
              <div
                key={faq.id}
                className="bg-card border border-border p-4 rounded-md space-y-2 hover:border-primary/40 transition-colors shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    {/* Reorder arrows */}
                    <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === faqs.length - 1}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                        {faq.category && (
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-secondary text-muted-foreground">
                            {faq.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground mt-1">{faq.question}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTogglePublished(faq)}
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-colors ${
                        faq.published
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                          : 'bg-gray-500/10 border-gray-500/30 text-gray-600'
                      }`}
                    >
                      {faq.published ? 'Live' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-1.5 rounded hover:bg-secondary text-primary transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id, faq.question)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-foreground/80 leading-relaxed pl-8 pt-1 border-t border-border/50">
                  {faq.answer}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right 1 Col: Create / Edit Form */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4 h-fit shadow-xs sticky top-24">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>{editingId ? 'Edit FAQ' : 'Add New FAQ'}</span>
            </h3>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyFaq);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <Field label="Category Group" required>
              <select
                className={inputClass}
                value={form.category || 'Brand Onboarding'}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {FAQ_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Question" required>
              <input
                required
                className={inputClass}
                placeholder="e.g. How are marketplace payouts processed?"
                value={form.question || ''}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </Field>

            <Field label="Detailed Answer" required>
              <textarea
                required
                className={`${inputClass} min-h-32 leading-relaxed`}
                placeholder="Comprehensive explanation, steps, or policies..."
                value={form.answer || ''}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
              />
            </Field>

            <label className="flex items-center gap-2 p-2 rounded bg-secondary/30 border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.published)}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-xs font-semibold">Published on Storefront</span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
            >
              {busy ? 'Saving...' : editingId ? 'Update FAQ' : 'Save FAQ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
