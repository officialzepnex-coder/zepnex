'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Store,
  Plus,
  Search,
  BadgeCheck,
  Sparkles,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Users,
  Package,
  Eye,
  LayoutGrid,
  List,
} from 'lucide-react';
import { PageHeader, inputClass } from '@/components/admin/AdminShell';
import DetailDrawer from '@/components/admin/DetailDrawer';
import { useToast } from '@/components/admin/ToastContext';
import { DataService } from '@/lib/supabase/data-service';
import type { BrandRow, ProductRow } from '@/types/database';

export default function AdminBrandsPage() {
  const { success, error: toastError } = useToast();
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [query, setQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'standard'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [drawerBrand, setDrawerBrand] = useState<BrandRow | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [b, p] = await Promise.all([DataService.getBrands(), DataService.getProducts()]);
      setBrands(b);
      setProducts(p);
    } catch {
      toastError('Failed to load brands');
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('zepnex_catalog_updated', handleUpdate);
    return () => window.removeEventListener('zepnex_catalog_updated', handleUpdate);
  }, [loadData]);

  const handleToggleVerified = async (brand: BrandRow, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await DataService.saveBrand({ ...brand, verified: !brand.verified });
      success('Verification Updated', `"${brand.name}" is now ${updated.verified ? 'Verified' : 'Unverified'}.`);
      loadData();
    } catch {
      toastError('Update Failed');
    }
  };

  const handleToggleFeatured = async (brand: BrandRow, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await DataService.saveBrand({ ...brand, featured: !brand.featured });
      success('Feature Flag Updated', `"${brand.name}" is now ${updated.featured ? 'Featured on Home' : 'Standard'}.`);
      loadData();
    } catch {
      toastError('Update Failed');
    }
  };

  const handleDelete = async (id: string, name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Delete brand "${name}" and unassign its products?`)) return;
    try {
      await DataService.deleteBrand(id);
      success('Brand Deleted', `Removed "${name}" from directory.`);
      if (drawerBrand?.id === id) setDrawerBrand(null);
      loadData();
    } catch {
      toastError('Delete Failed');
    }
  };

  const filtered = useMemo(() => {
    return brands.filter((b) => {
      const matchQuery =
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.location.toLowerCase().includes(query.toLowerCase()) ||
        b.tagline.toLowerCase().includes(query.toLowerCase());

      const matchVerified =
        filterVerified === 'all' ||
        (filterVerified === 'verified' && b.verified) ||
        (filterVerified === 'unverified' && !b.verified);

      const matchFeatured =
        filterFeatured === 'all' ||
        (filterFeatured === 'featured' && b.featured) ||
        (filterFeatured === 'standard' && !b.featured);

      return matchQuery && matchVerified && matchFeatured;
    });
  }, [brands, query, filterVerified, filterFeatured]);

  const brandProducts = drawerBrand
    ? products.filter((p) => p.brand_id === drawerBrand.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Slide-out Brand Inspector Drawer */}
      {drawerBrand && (
        <DetailDrawer
          isOpen={Boolean(drawerBrand)}
          onClose={() => setDrawerBrand(null)}
          title={drawerBrand.name}
          subtitle={drawerBrand.tagline || 'Partner Brand Profile'}
          badge={
            drawerBrand.verified ? (
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-200">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            ) : undefined
          }
          actions={
            <>
              <button
                onClick={() => handleDelete(drawerBrand.id, drawerBrand.name)}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-sm"
              >
                Delete Brand
              </button>
              <Link
                href={`/admin/brands/${drawerBrand.id}`}
                className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90"
              >
                Full Brand Editor
              </Link>
            </>
          }
        >
          <div className="space-y-5 text-sm">
            {/* Header & Logo */}
            <div className="relative rounded overflow-hidden border border-border">
              <div className="h-28 bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={drawerBrand.cover_image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-4 pt-0 bg-card flex items-end justify-between">
                <div className="w-16 h-16 rounded-full border-4 border-white bg-card overflow-hidden -mt-8 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={drawerBrand.logo} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {drawerBrand.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-secondary/30 rounded border border-border text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Rating</p>
                <p className="font-display text-lg font-bold text-foreground mt-0.5">⭐ {drawerBrand.rating}</p>
                <p className="text-[10px] text-muted-foreground">{drawerBrand.reviews} reviews</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Followers</p>
                <p className="font-display text-lg font-bold text-foreground mt-0.5">{drawerBrand.followers}</p>
                <p className="text-[10px] text-muted-foreground">Store Fans</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Products</p>
                <p className="font-display text-lg font-bold text-foreground mt-0.5">{brandProducts.length}</p>
                <p className="text-[10px] text-muted-foreground">In Catalog</p>
              </div>
            </div>

            {/* Story */}
            {drawerBrand.description && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">About the Brand</p>
                <p className="text-xs text-foreground/80 leading-relaxed bg-card p-3 rounded border border-border">
                  {drawerBrand.description}
                </p>
              </div>
            )}

            {/* Attached Products */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Listed Products ({brandProducts.length})
                </p>
                <Link
                  href="/admin/products/new"
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Product
                </Link>
              </div>

              {brandProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 bg-secondary/20 rounded text-center">
                  No products attached to this brand yet.
                </p>
              ) : (
                <div className="divide-y divide-border border border-border rounded overflow-hidden">
                  {brandProducts.map((p) => (
                    <div key={p.id} className="p-2.5 flex items-center justify-between gap-3 bg-card hover:bg-secondary/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" className="w-8 h-8 rounded object-cover bg-secondary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate text-foreground">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">₹{p.price} · {p.category}</p>
                        </div>
                      </div>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-xs text-primary font-semibold hover:underline shrink-0"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* Header */}
      <PageHeader
        title="Partner Brands Directory"
        subtitle="Manage verified artisan and merchant partners, bios, covers, logos, and verification status."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Brands' }]}
        action={
          <Link
            href="/admin/brands/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-md flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search brands by name, city, bio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            className="px-3 py-2 border border-border bg-card text-xs rounded-sm focus:outline-none focus:border-primary"
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value as typeof filterVerified)}
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>

          <select
            className="px-3 py-2 border border-border bg-card text-xs rounded-sm focus:outline-none focus:border-primary"
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value as typeof filterFeatured)}
          >
            <option value="all">All Feature Status</option>
            <option value="featured">Featured on Home</option>
            <option value="standard">Standard</option>
          </select>

          <div className="flex items-center border border-border rounded-sm overflow-hidden ml-auto md:ml-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:text-foreground'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:text-foreground'}`}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Brands Content */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border p-12 rounded-md text-center space-y-3">
          <Store className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
          <h3 className="font-semibold text-base">No brands match your search</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search keywords or reset the verification filter.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <div
              key={b.id}
              onClick={() => setDrawerBrand(b)}
              className="bg-card border border-border rounded-md overflow-hidden hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Cover Banner & Logo */}
              <div className="h-28 bg-secondary relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.cover_image} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  {b.featured && (
                    <span className="p-1 rounded bg-black/60 text-amber-400 backdrop-blur-xs shadow-xs" title="Featured Brand">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-end justify-between -mt-6 mb-2">
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-card overflow-hidden shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.logo} alt="" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={(e) => handleToggleVerified(b, e)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                        b.verified
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                          : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
                      }`}
                    >
                      <BadgeCheck className="w-3 h-3" />
                      <span>{b.verified ? 'Verified' : 'Verify'}</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-base text-foreground">{b.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{b.tagline}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-primary" /> {b.location}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>⭐ {b.rating} ({b.reviews})</span>
                  <span>{b.followers} followers</span>
                </div>
              </div>

              <div className="px-4 py-2.5 bg-secondary/30 border-t border-border flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleToggleFeatured(b, e)}
                  className={`text-[10px] font-semibold ${b.featured ? 'text-amber-600 font-bold' : 'text-muted-foreground'}`}
                >
                  {b.featured ? '★ Featured on Home' : '☆ Not Featured'}
                </button>
                <div className="flex items-center gap-3">
                  <Link href={`/admin/brands/${b.id}`} className="text-primary font-semibold hover:underline">
                    Edit
                  </Link>
                  <button onClick={(e) => handleDelete(b.id, b.name, e)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 uppercase tracking-wider text-muted-foreground border-b border-border text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Followers</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setDrawerBrand(b)}
                    className="hover:bg-secondary/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden shrink-0 border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={b.logo} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-foreground">{b.name}</p>
                            {b.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate max-w-xs">{b.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.location}</td>
                    <td className="px-4 py-3">⭐ {b.rating} ({b.reviews})</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.followers}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => handleToggleVerified(b, e)}
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          b.verified ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {b.verified ? 'Verified' : 'Standard'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/admin/brands/${b.id}`}
                          className="p-1.5 rounded hover:bg-secondary text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={(e) => handleDelete(b.id, b.name, e)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
