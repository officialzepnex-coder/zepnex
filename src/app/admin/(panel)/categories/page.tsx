'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tags,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Check,
  Package,
  Sparkles,
  Folder,
} from 'lucide-react';
import { PageHeader, Field, inputClass } from '@/components/admin/AdminShell';
import { useToast } from '@/components/admin/ToastContext';
import { DataService } from '@/lib/supabase/data-service';
import { slugify } from '@/lib/mappers';
import type { CategoryRow, ProductRow } from '@/types/database';

export default function AdminCategoriesPage() {
  const { success, error: toastError } = useToast();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CategoryRow>>({});
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([DataService.getCategories(), DataService.getProducts()]);
      setCategories(c.sort((a, b) => a.sort_order - b.sort_order));
      setProducts(p);
    } catch {
      toastError('Failed to load categories');
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('zepnex_catalog_updated', handleUpdate);
    return () => window.removeEventListener('zepnex_catalog_updated', handleUpdate);
  }, [loadData]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const id = slugify(newName.trim());
      await DataService.saveCategory({
        id,
        name: newName.trim(),
        sort_order: categories.length + 1,
        published: true,
      });
      success('Category Created', `Added category "${newName.trim()}".`);
      setNewName('');
      loadData();
    } catch {
      toastError('Failed to add category');
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const current = categories[index];
    const target = categories[targetIndex];

    try {
      await Promise.all([
        DataService.saveCategory({ ...current, sort_order: target.sort_order }),
        DataService.saveCategory({ ...target, sort_order: current.sort_order }),
      ]);
      loadData();
    } catch {
      toastError('Failed to reorder');
    }
  };

  const startEdit = (cat: CategoryRow) => {
    setEditingId(cat.id);
    setEditForm(cat);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.name) return;
    try {
      await DataService.saveCategory(editForm);
      success('Category Updated', `Saved changes for "${editForm.name}".`);
      setEditingId(null);
      loadData();
    } catch {
      toastError('Failed to update category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const attachedCount = products.filter((p) => p.category.toLowerCase() === name.toLowerCase()).length;
    if (attachedCount > 0) {
      if (!confirm(`Warning: ${attachedCount} products are currently listed in category "${name}". Delete anyway?`)) {
        return;
      }
    } else {
      if (!confirm(`Delete category "${name}"?`)) return;
    }

    try {
      await DataService.deleteCategory(id);
      success('Category Deleted', `Removed "${name}".`);
      loadData();
    } catch {
      toastError('Delete Failed');
    }
  };

  const handleTogglePublished = async (cat: CategoryRow) => {
    try {
      await DataService.saveCategory({ ...cat, published: !cat.published });
      success('Visibility Updated', `Category is now ${!cat.published ? 'Live' : 'Hidden'}.`);
      loadData();
    } catch {
      toastError('Update Failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Categories Matrix"
        subtitle="Organize catalog taxonomy, store navigation filters, display order, and product assignments."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Categories' }]}
      />

      {/* Add Category Card */}
      <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <span>Add New Category</span>
        </h3>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            required
            className={inputClass}
            placeholder="Category Name (e.g. Footwear & Bags, Sustainable Decor)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy || !newName.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 disabled:opacity-50 shrink-0 transition-colors shadow-xs"
          >
            {busy ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Categories Reorderable List */}
      <div className="bg-card border border-border rounded-md divide-y divide-border overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-secondary/50 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Display Order & Category</span>
          <span>Products · Status · Actions</span>
        </div>

        {categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">No categories found. Add one above.</div>
        ) : (
          categories.map((cat, idx) => {
            const isEditing = editingId === cat.id;
            const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;

            return (
              <div key={cat.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Up/Down Arrow Reorder Controls */}
                  <div className="flex flex-col gap-0.5 shrink-0">
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
                      disabled={idx === categories.length - 1}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="w-6 text-center font-mono text-xs font-semibold text-muted-foreground">
                    #{idx + 1}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        className={`${inputClass} max-w-xs`}
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{cat.name}</p>
                        <span className="text-[10px] font-mono text-muted-foreground">({cat.id})</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded bg-secondary">
                    <Package className="w-3.5 h-3.5 text-primary" />
                    <span>{count} products</span>
                  </span>

                  <button
                    onClick={() => handleTogglePublished(cat)}
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      cat.published
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                        : 'bg-gray-500/10 border-gray-500/30 text-gray-600'
                    }`}
                  >
                    {cat.published ? 'Live' : 'Hidden'}
                  </button>

                  <div className="flex items-center gap-1">
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded hover:bg-secondary text-primary transition-colors"
                        title="Edit Category Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
