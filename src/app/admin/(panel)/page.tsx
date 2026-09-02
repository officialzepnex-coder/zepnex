'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Package,
  Store,
  Inbox,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Database,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
  Star,
  DollarSign,
  Users,
  FileText,
  Settings2,
  CheckCircle2,
  XCircle,
  Tags,
  MessageSquareText,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { formatInr } from '@/lib/mappers';
import { DataService } from '@/lib/supabase/data-service';
import { SyncEngine } from '@/lib/supabase/sync';
import { useToast } from '@/components/admin/ToastContext';
import type { ApplicationRow, BrandRow, ProductRow, ReviewRow, ActivityLog } from '@/types/database';

export default function AdminDashboardPage() {
  const { success, error: toastError } = useToast();
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; isFallback: boolean; message: string }>({
    ok: true,
    isFallback: false,
    message: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [b, p, a, r, status] = await Promise.all([
        DataService.getBrands(),
        DataService.getProducts(),
        DataService.getApplications(),
        DataService.getReviews(),
        DataService.checkConnection(),
      ]);
      setBrands(b);
      setProducts(p);
      setApplications(a);
      setReviews(r);
      setDbStatus(status);
      setLogs(DataService.getLogs().slice(0, 8));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('zepnex_catalog_updated', handleUpdate);
    return () => window.removeEventListener('zepnex_catalog_updated', handleUpdate);
  }, [loadData]);

  const handleQuickRestock = async (product: ProductRow) => {
    try {
      await DataService.saveProduct({ ...product, in_stock: true, stock_quantity: 50 });
      success('Product Restocked', `Marked "${product.name}" as In Stock (50 units).`);
      loadData();
    } catch (err) {
      toastError('Restock Failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleQuickApproveApp = async (app: ApplicationRow) => {
    try {
      await DataService.convertApplicationToBrand(app);
      success('Application Approved!', `Brand "${app.brand_name}" was created and added to the storefront!`);
      loadData();
    } catch (err) {
      toastError('Approval Failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleQuickSync = async () => {
    setSyncing(true);
    try {
      const res = await SyncEngine.pushSampleDataToSupabase(() => {});
      if (res.success) {
        success('Database Synced', res.message);
        loadData();
      } else {
        toastError('Sync Notice', res.message);
      }
    } catch (err) {
      toastError('Sync Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSyncing(false);
    }
  };

  // Metrics computations
  const pendingApps = applications.filter((a) => a.status === 'pending');
  const approvedApps = applications.filter((a) => a.status === 'approved');
  const rejectedApps = applications.filter((a) => a.status === 'rejected');
  const catalogValue = products.reduce((sum, p) => sum + Number(p.price || 0), 0);
  const inStockCount = products.filter((p) => p.in_stock).length;
  const outOfStockProducts = products.filter((p) => !p.in_stock);
  const featuredProducts = products.filter((p) => p.featured).length;
  const publishedProducts = products.filter((p) => p.published).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
      : '—';
  const avgPrice =
    products.length > 0
      ? Math.round(products.reduce((sum, p) => sum + Number(p.price || 0), 0) / products.length)
      : 0;
  const verifiedBrands = brands.filter((b) => b.verified).length;

  const byCategory = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const stockDistribution = [
    { name: 'In Stock', value: inStockCount, color: '#10B981' },
    { name: 'Out of Stock', value: products.length - inStockCount, color: '#EF4444' },
  ];

  // Top brands by product count
  const topBrands = [...brands]
    .map((b) => ({
      ...b,
      actualProductCount: products.filter((p) => p.brand_id === b.id).length,
    }))
    .sort((a, b) => b.actualProductCount - a.actualProductCount)
    .slice(0, 5);

  const kpiStats = [
    {
      label: 'Total Catalog Value',
      value: formatInr(catalogValue),
      subtext: `${products.length} listings · ${publishedProducts} published`,
      icon: TrendingUp,
      href: '/admin/products',
      color: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      label: 'Partner Brands',
      value: brands.length,
      subtext: `${verifiedBrands} verified · ${brands.length - verifiedBrands} pending`,
      icon: Store,
      href: '/admin/brands',
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Stock Health',
      value: `${inStockCount} / ${products.length}`,
      subtext: `${products.length - inStockCount} items need restocking`,
      icon: Package,
      href: '/admin/products',
      color: 'text-blue-600 bg-blue-500/10',
    },
    {
      label: 'Pending Applications',
      value: pendingApps.length,
      subtext: `${approvedApps.length} approved · ${rejectedApps.length} rejected`,
      icon: Inbox,
      href: '/admin/applications',
      color: pendingApps.length > 0 ? 'text-amber-600 bg-amber-500/10' : 'text-emerald-600 bg-emerald-500/10',
    },
    {
      label: 'Avg. Rating',
      value: avgRating,
      subtext: `${reviews.length} total reviews received`,
      icon: Star,
      href: '/admin/reviews',
      color: 'text-yellow-600 bg-yellow-500/10',
    },
    {
      label: 'Avg. Product Price',
      value: avgPrice > 0 ? formatInr(avgPrice) : '—',
      subtext: `${featuredProducts} featured · ${products.length} total`,
      icon: DollarSign,
      href: '/admin/products',
      color: 'text-violet-600 bg-violet-500/10',
    },
  ];

  const quickActions = [
    { label: 'Add Product', icon: Package, href: '/admin/products/new', color: 'bg-primary/10 text-primary' },
    { label: 'Add Brand', icon: Store, href: '/admin/brands/new', color: 'bg-blue-500/10 text-blue-600' },
    { label: 'View Applications', icon: Inbox, href: '/admin/applications', color: 'bg-amber-500/10 text-amber-600', badge: pendingApps.length > 0 ? pendingApps.length : undefined },
    { label: 'Manage Users', icon: Users, href: '/admin/users', color: 'bg-violet-500/10 text-violet-600' },
    { label: 'Audit Logs', icon: FileText, href: '/admin/logs', color: 'bg-slate-500/10 text-slate-600' },
    { label: 'Site Settings', icon: Settings2, href: '/admin/settings', color: 'bg-emerald-500/10 text-emerald-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Marketplace Overview" subtitle="Loading platform data..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-md p-5 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Marketplace Overview"
        subtitle="Real-time catalog metrics, inventory status, incoming brand applications, and system health."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
            <Link
              href="/admin/brands/new"
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-secondary text-xs font-semibold rounded-sm transition-colors"
            >
              <Store className="w-4 h-4 text-primary" />
              <span>Add Brand</span>
            </Link>
          </div>
        }
      />

      {/* Database Connection Banner */}
      <div
        className={`p-4 rounded-md border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
          dbStatus.ok && !dbStatus.isFallback
            ? 'bg-emerald-950/10 border-emerald-500/30'
            : 'bg-amber-950/10 border-amber-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              dbStatus.ok && !dbStatus.isFallback
                ? 'bg-emerald-500/20 text-emerald-600'
                : 'bg-amber-500/20 text-amber-600'
            }`}
          >
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider">
                {dbStatus.ok && !dbStatus.isFallback
                  ? 'Supabase Postgres — Live Sync Active'
                  : 'Persistent Local Storage Mode'}
              </p>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  dbStatus.ok && !dbStatus.isFallback
                    ? 'bg-emerald-500/20 text-emerald-700'
                    : 'bg-amber-500/20 text-amber-700'
                }`}
              >
                {dbStatus.ok && !dbStatus.isFallback ? 'Cloud Synchronized' : 'Offline / Local'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              All edits update the live storefront instantly. Push sample records to Supabase with 1 click.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleQuickSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync to Supabase'}</span>
          </button>
          <Link
            href="/admin/sync"
            className="px-3 py-1.5 border border-border bg-card hover:bg-secondary text-xs font-semibold rounded-sm transition-colors"
          >
            Sync Hub
          </Link>
        </div>
      </div>

      {/* KPI Cards — 6-tile grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiStats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-card border border-border p-5 rounded-md hover:border-primary/50 hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="font-display text-3xl font-bold mt-2 text-foreground">{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-md ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center justify-between">
                <span>{s.subtext}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-card border border-border rounded-md p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-base text-foreground">Quick Actions</h2>
            <p className="text-xs text-muted-foreground">Most-used admin operations at a glance</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-3 rounded-md border border-border hover:border-primary/40 hover:shadow-sm transition-all group text-center relative"
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-foreground leading-tight">{action.label}</span>
                {action.badge !== undefined && action.badge > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products by Category Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-5 rounded-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-base text-foreground">Catalog Distribution by Category</h2>
              <p className="text-xs text-muted-foreground">Product listing breakdown across marketplace verticals</p>
            </div>
            <Link href="/admin/products" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              <span>View catalog</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-64 pt-2">
            {byCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No products yet — <Link href="/admin/products/new" className="text-primary ml-1 hover:underline">add one</Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7A7060' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7A7060' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1C1A16', borderColor: '#333', color: '#fff', borderRadius: '4px', fontSize: '12px' }} itemStyle={{ color: '#C8813A' }} />
                  <Bar dataKey="count" fill="#C8813A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stock Status Pie */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-base text-foreground">Inventory Health</h2>
            <p className="text-xs text-muted-foreground">Availability across {products.length} products</p>
          </div>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1C1A16', borderColor: '#333', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 border-t border-border pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                In Stock ({inStockCount})
              </span>
              <span className="font-semibold">{Math.round((inStockCount / (products.length || 1)) * 100)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Out of Stock ({products.length - inStockCount})
              </span>
              <span className="font-semibold">{Math.round(((products.length - inStockCount) / (products.length || 1)) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Applications + Activity + Top Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Brand Applications */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-base">Inbound Applications</h2>
            </div>
            <Link href="/admin/applications" className="text-xs text-primary font-semibold hover:underline">
              View all ({applications.length})
            </Link>
          </div>
          {applications.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">No applications received yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{app.brand_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.email} · {app.category || 'General'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {app.status === 'pending' ? (
                      <button
                        onClick={() => handleQuickApproveApp(app)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-700' : 'bg-red-500/20 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-base">Recent Activity</h2>
            </div>
            <Link href="/admin/logs" className="text-xs text-primary font-semibold hover:underline">
              Audit logs
            </Link>
          </div>
          <div className="divide-y divide-border">
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No recent activity logged.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 flex items-start gap-2">
                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                      log.action === 'create' ? 'bg-emerald-500' :
                      log.action === 'update' ? 'bg-blue-500' :
                      log.action === 'delete' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{log.title}</p>
                      {log.details && <p className="text-muted-foreground text-[11px] mt-0.5 truncate max-w-[160px]">{log.details}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Brands by Product Count */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-base">Top Brands</h2>
            </div>
            <Link href="/admin/brands" className="text-xs text-primary font-semibold hover:underline">
              View all
            </Link>
          </div>
          {topBrands.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No brands yet. <Link href="/admin/brands/new" className="text-primary hover:underline">Add one</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {topBrands.map((brand, i) => (
                <div key={brand.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-muted-foreground text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate text-foreground">{brand.name}</p>
                      {brand.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min((brand.actualProductCount / (topBrands[0]?.actualProductCount || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{brand.actualProductCount}p</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-border text-xs text-muted-foreground">
            {brands.length} total brands · {verifiedBrands} verified
          </div>
        </div>
      </div>

      {/* Platform Status Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: reviews.length, icon: MessageSquareText, color: 'text-yellow-600', href: '/admin/reviews' },
          { label: 'Published Products', value: publishedProducts, icon: Package, color: 'text-emerald-600', href: '/admin/products' },
          { label: 'Featured Items', value: featuredProducts, icon: Tags, color: 'text-violet-600', href: '/admin/products' },
          { label: 'Approved Brands', value: approvedApps.length, icon: CheckCircle2, color: 'text-blue-600', href: '/admin/applications' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-card border border-border rounded-md p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center">
                <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Out of Stock Alert */}
      {outOfStockProducts.length > 0 && (
        <div className="p-4 rounded-md border border-amber-500/30 bg-amber-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Stock Alert — {outOfStockProducts.length} items out of stock
              </span>
            </div>
            <Link href="/admin/products" className="text-xs text-primary font-semibold hover:underline">
              Manage inventory
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {outOfStockProducts.slice(0, 3).map((prod) => (
              <div key={prod.id} className="p-3 bg-card border border-border rounded flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{prod.name}</p>
                  <p className="text-[11px] text-muted-foreground">{prod.brand_name} · ₹{prod.price}</p>
                </div>
                <button
                  onClick={() => handleQuickRestock(prod)}
                  className="px-2 py-1 bg-primary text-white rounded text-[10px] font-semibold hover:bg-primary/90 shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}
            {outOfStockProducts.length > 3 && (
              <Link href="/admin/products" className="p-3 bg-card border border-dashed border-border rounded flex items-center justify-center gap-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                +{outOfStockProducts.length - 3} more items
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
