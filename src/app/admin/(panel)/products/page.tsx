'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Percent,
  CheckSquare,
  Square,
  Sparkles,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { PageHeader, inputClass } from '@/components/admin/AdminShell';
import DetailDrawer from '@/components/admin/DetailDrawer';
import { useToast } from '@/components/admin/ToastContext';
import { formatInr } from '@/lib/mappers';
import { DataService } from '@/lib/supabase/data-service';
import type { ProductRow, BrandRow, CategoryRow } from '@/types/database';

export default function AdminProductsPage() {
  const { success, error: toastError } = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & View State
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'rating'>('name');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Multi-select Batch Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer Quick-Peek State
  const [drawerProduct, setDrawerProduct] = useState<ProductRow | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [p, b, c] = await Promise.all([
        DataService.getProducts(),
        DataService.getBrands(),
        DataService.getCategories(),
      ]);
      setProducts(p);
      setBrands(b);
      setCategories(c);
    } catch (err) {
      toastError('Load Error', err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('zepnex_catalog_updated', handleUpdate);
    return () => window.removeEventListener('zepnex_catalog_updated', handleUpdate);
  }, [loadData]);

  // Inline Toggles
  const handleToggleStock = async (product: ProductRow, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await DataService.saveProduct({
        ...product,
        in_stock: !product.in_stock,
        stock_quantity: !product.in_stock ? 45 : 0,
      });
      success('Stock Updated', `"${product.name}" is now ${updated.in_stock ? 'In Stock' : 'Out of Stock'}.`);
      loadData();
    } catch {
      toastError('Update Failed');
    }
  };

  const handleTogglePublished = async (product: ProductRow, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await DataService.saveProduct({
        ...product,
        published: !product.published,
      });
      success('Visibility Updated', `"${product.name}" is now ${updated.published ? 'Published' : 'Hidden'}.`);
      loadData();
    } catch {
      toastError('Update Failed');
    }
  };

  const handleDelete = async (id: string, name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await DataService.deleteProduct(id);
      success('Product Deleted', `Deleted "${name}" from catalog.`);
      if (drawerProduct?.id === id) setDrawerProduct(null);
      loadData();
    } catch {
      toastError('Delete Failed');
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.length} selected products?`)) return;
    try {
      await DataService.bulkDeleteProducts(selectedIds);
      success('Bulk Deleted', `Deleted ${selectedIds.length} products.`);
      setSelectedIds([]);
      loadData();
    } catch {
      toastError('Bulk Delete Failed');
    }
  };

  const handleBulkPublish = async (published: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await DataService.bulkUpdateProductStatus(selectedIds, { published });
      success('Bulk Updated', `Marked ${selectedIds.length} products as ${published ? 'Published' : 'Draft'}.`);
      setSelectedIds([]);
      loadData();
    } catch {
      toastError('Bulk Update Failed');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const toggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filtered & Sorted list
  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchesQuery =
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand_name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          (p.badge && p.badge.toLowerCase().includes(query.toLowerCase()));

        const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesBrand = selectedBrand === 'all' || p.brand_id === selectedBrand;
        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'in_stock' && p.in_stock) ||
          (stockFilter === 'out_of_stock' && !p.in_stock);

        return matchesQuery && matchesCat && matchesBrand && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
        return a.name.localeCompare(b.name);
      });
  }, [products, query, selectedCategory, selectedBrand, stockFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Slide-Out Detail Inspector Drawer */}
      {drawerProduct && (
        <DetailDrawer
          isOpen={Boolean(drawerProduct)}
          onClose={() => setDrawerProduct(null)}
          title={drawerProduct.name}
          subtitle={`${drawerProduct.brand_name} · ${drawerProduct.category}`}
          badge={
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                drawerProduct.in_stock ? 'bg-emerald-500/20 text-emerald-700' : 'bg-red-500/20 text-red-700'
              }`}
            >
              {drawerProduct.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          }
          actions={
            <>
              <button
                onClick={() => handleDelete(drawerProduct.id, drawerProduct.name)}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-sm"
              >
                Delete
              </button>
              <Link
                href={`/admin/products/${drawerProduct.id}`}
                className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90"
              >
                Full Editor
              </Link>
            </>
          }
        >
          <div className="space-y-5 text-sm">
            <div className="aspect-video bg-secondary rounded overflow-hidden relative border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={drawerProduct.image} alt={drawerProduct.name} className="w-full h-full object-contain" />
              {drawerProduct.badge && (
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">
                  {drawerProduct.badge}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded border border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Price</p>
                <p className="font-display text-xl font-bold mt-0.5">{formatInr(Number(drawerProduct.price))}</p>
                {drawerProduct.original_price && (
                  <p className="text-xs text-muted-foreground line-through">MRP {formatInr(Number(drawerProduct.original_price))}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Rating & Reviews</p>
                <p className="text-sm font-semibold mt-0.5">⭐ {drawerProduct.rating} ({drawerProduct.reviews} reviews)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Brand ID: {drawerProduct.brand_id}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Description</p>
              <p className="text-xs text-foreground/80 leading-relaxed bg-card p-3 rounded border border-border">
                {drawerProduct.description || 'No description provided.'}
              </p>
            </div>

            {drawerProduct.images && drawerProduct.images.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Gallery Images ({drawerProduct.images.length})</p>
                <div className="flex flex-wrap gap-2">
                  {drawerProduct.images.map((img, i) => (
                    <div key={i} className="w-16 h-16 rounded border border-border bg-secondary overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DetailDrawer>
      )}

      {/* Header */}
      <PageHeader
        title="Products Catalog"
        subtitle="Manage product specifications, pricing, inventory stock levels, promotional badges, and gallery media."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Products' }]}
        action={
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-card border border-border p-4 rounded-md space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search by title, brand, badge..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <select
              className="px-3 py-2 border border-border bg-card text-xs rounded-sm focus:outline-none focus:border-primary"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              className="px-3 py-2 border border-border bg-card text-xs rounded-sm focus:outline-none focus:border-primary"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="all">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              className="px-3 py-2 border border-border bg-card text-xs rounded-sm focus:outline-none focus:border-primary"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Out of Stock Only</option>
            </select>

            {/* Sort Filter */}
            <select
              className="px-3 py-2 border border-border bg-card text-xs rounded-sm focus:outline-none focus:border-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
              <option value="rating">Sort: Top Rated</option>
            </select>

            {/* Table / Grid Toggle */}
            <div className="flex items-center border border-border rounded-sm overflow-hidden ml-auto md:ml-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (when items selected) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-primary/10 border border-primary/30 rounded flex items-center justify-between gap-3 text-xs animate-fade-in">
            <span className="font-semibold text-primary">
              {selectedIds.length} {selectedIds.length === 1 ? 'product' : 'products'} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkPublish(true)}
                className="px-2.5 py-1 bg-card border border-border hover:bg-secondary rounded font-semibold text-foreground"
              >
                Bulk Publish
              </button>
              <button
                onClick={() => handleBulkPublish(false)}
                className="px-2.5 py-1 bg-card border border-border hover:bg-secondary rounded font-semibold text-foreground"
              >
                Bulk Hide (Draft)
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1 bg-red-600 text-white rounded font-semibold hover:bg-red-700"
              >
                Bulk Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Content: Table or Grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border p-12 rounded-md text-center space-y-3">
          <Package className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
          <h3 className="font-semibold text-base">No products match your criteria</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting search terms or reset filters to see all products in your catalog.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('all');
              setSelectedBrand('all');
              setStockFilter('all');
            }}
            className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 uppercase tracking-wider text-muted-foreground border-b border-border text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleSelectAll} className="p-0.5">
                      {selectedIds.length > 0 && selectedIds.length === filtered.length ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock Status</th>
                  <th className="px-4 py-3">Visibility</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setDrawerProduct(p)}
                      className={`hover:bg-secondary/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3" onClick={(e) => toggleSelectId(p.id, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-secondary overflow-hidden shrink-0 border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate max-w-xs">{p.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {p.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                                  {p.badge}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">⭐ {p.rating}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.brand_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold font-display text-sm">{formatInr(Number(p.price))}</span>
                        {p.original_price && (
                          <span className="block text-[10px] text-muted-foreground line-through">
                            {formatInr(Number(p.original_price))}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => handleToggleStock(p, e)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-colors ${
                            p.in_stock
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 border-red-500/30 text-red-700 hover:bg-red-500/20'
                          }`}
                        >
                          {p.in_stock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => handleTogglePublished(p, e)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-colors ${
                            p.published
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-700'
                              : 'bg-gray-500/10 border-gray-500/30 text-gray-600'
                          }`}
                        >
                          {p.published ? 'Live' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded hover:bg-secondary text-primary hover:text-primary/80 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(p.id, p.name, e)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => setDrawerProduct(p)}
                className={`bg-card border rounded-md overflow-hidden hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
                }`}
              >
                <div className="relative aspect-square bg-secondary overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  {p.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded">
                      {p.badge}
                    </span>
                  )}
                  <button
                    onClick={(e) => toggleSelectId(p.id, e)}
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded shadow-xs"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{p.brand_name}</p>
                    <h4 className="font-semibold text-xs text-foreground truncate mt-0.5">{p.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{p.category} · ⭐ {p.rating}</p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="font-display font-bold text-sm text-foreground">{formatInr(Number(p.price))}</span>
                      {p.original_price && (
                        <span className="block text-[10px] text-muted-foreground line-through">
                          {formatInr(Number(p.original_price))}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleToggleStock(p, e)}
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        p.in_stock ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'
                      }`}
                    >
                      {p.in_stock ? 'In Stock' : 'Out'}
                    </button>
                  </div>
                </div>

                <div className="px-3.5 py-2 bg-secondary/30 border-t border-border flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] text-muted-foreground">{p.published ? 'Published' : 'Draft'}</span>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${p.id}`} className="text-primary font-semibold hover:underline">
                      Edit
                    </Link>
                    <button onClick={(e) => handleDelete(p.id, p.name, e)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
