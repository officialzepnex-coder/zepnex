'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Copy,
  Check,
  Server,
  Layers,
  ArrowDownToLine,
  ArrowUpToLine,
  RotateCcw,
  Sparkles,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { useToast } from '@/components/admin/ToastContext';
import { SyncEngine, type DatabaseStats } from '@/lib/supabase/sync';
import { DataService } from '@/lib/supabase/data-service';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { SyncStepResult } from '@/types/database';

export default function AdminSyncPage() {
  const { success, error, info } = useToast();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSteps, setSyncSteps] = useState<SyncStepResult[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'schema' | 'backup'>('sync');

  const loadStats = useCallback(async () => {
    try {
      const s = await SyncEngine.getStats();
      setStats(s);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handlePushSampleData = async () => {
    setSyncing(true);
    setSyncSteps([]);
    try {
      const result = await SyncEngine.pushSampleDataToSupabase((step) => {
        setSyncSteps((prev) => {
          const filtered = prev.filter((s) => s.step !== step.step);
          return [...filtered, step];
        });
      });

      if (result.success) {
        success('Database Synchronized!', result.message);
        loadStats();
      } else {
        error('Sync Incomplete', result.message);
      }
    } catch (err) {
      error('Sync Failed', err instanceof Error ? err.message : 'Unknown sync error');
    } finally {
      setSyncing(false);
    }
  };

  const handlePullData = async () => {
    setSyncing(true);
    try {
      const result = await SyncEngine.pullSupabaseToLocal((step) => {
        setSyncSteps([step]);
      });
      if (result.success) {
        success('Pulled Data', result.message);
        loadStats();
      } else {
        error('Pull Failed', result.message);
      }
    } catch (err) {
      error('Pull Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSyncing(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all catalog data to initial factory sample data? Custom additions in local cache will be reset.')) {
      DataService.resetToFactoryDefaults();
      success('Reset Complete', 'All catalog entities have been restored to initial curated sample records.');
      loadStats();
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await DataService.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zepnex-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('Export Successful', 'Downloaded complete catalog JSON backup.');
    } catch (err) {
      error('Export Failed', err instanceof Error ? err.message : 'Unknown export error');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await DataService.importAllData(json);
        success('Import Successful', 'Restored catalog records from backup file.');
        loadStats();
      } catch {
        error('Import Error', 'Invalid JSON backup file provided.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopySchema = () => {
    const schemaSql = `-- Run this in Supabase -> SQL Editor
create extension if not exists pgcrypto;

create table if not exists public.brands (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  tagline text not null default '',
  logo text not null default '',
  cover_image text not null default '',
  location text not null default '',
  rating numeric(3,1) not null default 0,
  reviews int not null default 0,
  followers int not null default 0,
  product_count int not null default 0,
  description text not null default '',
  verified boolean not null default false,
  website text,
  contact_email text,
  featured boolean not null default true,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  brand_id text not null references public.brands (id) on delete cascade,
  brand_name text not null default '',
  category text not null default 'Daily Use',
  price numeric(12,2) not null default 0,
  original_price numeric(12,2),
  rating numeric(3,1) not null default 0,
  reviews int not null default 0,
  image text not null default '',
  images text[] default '{}',
  description text not null default '',
  in_stock boolean not null default true,
  badge text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  sort_order int not null default 0,
  published boolean not null default true
);

create table if not exists public.reviews (
  id text primary key default gen_random_uuid()::text,
  kind text not null default 'brand',
  brand_id text references public.brands (id) on delete cascade,
  product_id text references public.products (id) on delete cascade,
  author text not null,
  role text,
  rating int not null default 5,
  comment text not null,
  avatar text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_applications (
  id text primary key default gen_random_uuid()::text,
  brand_name text not null,
  email text not null,
  phone text,
  category text,
  message text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id text primary key default gen_random_uuid()::text,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.reviews enable row level security;
alter table public.brand_applications enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;

create policy "public read brands" on public.brands for select using (true);
create policy "admin write brands" on public.brands for all using (true) with check (true);
create policy "public read products" on public.products for select using (true);
create policy "admin write products" on public.products for all using (true) with check (true);
create policy "public read categories" on public.categories for select using (true);
create policy "admin write categories" on public.categories for all using (true) with check (true);
create policy "public read reviews" on public.reviews for select using (true);
create policy "admin write reviews" on public.reviews for all using (true) with check (true);
create policy "public insert applications" on public.brand_applications for insert with check (true);
create policy "admin read applications" on public.brand_applications for select using (true);
create policy "admin write applications" on public.brand_applications for all using (true) with check (true);
create policy "public read faqs" on public.faqs for select using (true);
create policy "admin write faqs" on public.faqs for all using (true) with check (true);
create policy "public read settings" on public.site_settings for select using (true);
create policy "admin write settings" on public.site_settings for all using (true) with check (true);`;

    navigator.clipboard.writeText(schemaSql);
    setCopiedSql(true);
    success('Copied SQL Schema', 'You can now paste this directly into the Supabase SQL Editor.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supabase Database & Sync Hub"
        subtitle="Manage live database synchronization, schema migrations, table health, and catalog backups."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Database & Sync' }]}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={loadStats}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card hover:bg-secondary rounded-sm text-xs font-semibold text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Status
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'sync' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Zap className="w-4 h-4" />
          Sync & Tables
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'schema' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Database className="w-4 h-4" />
          SQL Schema & Policies
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'backup' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          JSON Backup & Restore
        </button>
      </div>

      {activeTab === 'sync' && (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className={`p-5 rounded-md border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            stats?.connected
              ? 'bg-emerald-950/10 border-emerald-500/30'
              : 'bg-amber-950/10 border-amber-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${stats?.connected ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">
                    {stats?.connected ? 'Supabase Database Connected' : 'Supabase Database Not Connected'}
                  </h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    stats?.connected ? 'bg-emerald-500/20 text-emerald-700' : 'bg-amber-500/20 text-amber-700'
                  }`}>
                    {stats?.connected ? 'Live Postgres' : 'Offline Cache'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats?.connected
                    ? `Connected to ${stats.supabaseUrl}`
                    : 'Changes made in the admin panel persist in your browser cache and sync instantly with the live storefront.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handlePushSampleData}
                disabled={syncing}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xs"
              >
                <ArrowUpToLine className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                <span>{syncing ? 'Pushing Data...' : '1-Click Sync Sample Data to Supabase'}</span>
              </button>

              <button
                onClick={handlePullData}
                disabled={syncing || !configured}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-border bg-card hover:bg-secondary text-xs font-medium rounded-sm disabled:opacity-40 transition-colors"
                title="Pull data from Supabase to local browser cache"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span className="hidden sm:inline">Pull to Local</span>
              </button>
            </div>
          </div>

          {/* Sync Progress / Log Stream */}
          {syncSteps.length > 0 && (
            <div className="bg-card border border-border rounded-md p-5 space-y-3 animate-fade-in">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Synchronization Live Log</span>
              </h4>
              <div className="space-y-2">
                {syncSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-secondary/40 text-xs">
                    <div className="flex items-center gap-2.5">
                      {step.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {step.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {step.status === 'running' && <RefreshCw className="w-4 h-4 text-primary animate-spin" />}
                      <span className="font-medium text-foreground">{step.step}</span>
                    </div>
                    <span className="text-muted-foreground">{step.message || (step.count !== undefined ? `${step.count} items` : '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table Metrics Comparison Grid */}
          <div className="bg-card border border-border rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">Database Tables & Entity Matrix</h3>
                <p className="text-xs text-muted-foreground">Comparison of records between Supabase Postgres and Local Fallback Cache</p>
              </div>
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Sample Data</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: 'Brands', key: 'brands', count: stats?.counts.brands },
                { name: 'Products', key: 'products', count: stats?.counts.products },
                { name: 'Categories', key: 'categories', count: stats?.counts.categories },
                { name: 'Reviews', key: 'reviews', count: stats?.counts.reviews },
                { name: 'Applications', key: 'applications', count: stats?.counts.applications },
                { name: 'FAQs', key: 'faqs', count: stats?.counts.faqs },
              ].map((tbl) => (
                <div key={tbl.key} className="p-3.5 rounded border border-border bg-secondary/30 text-center space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tbl.name}</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {tbl.count?.local ?? 0}
                  </p>
                  <div className="text-[11px] flex items-center justify-center gap-2 text-muted-foreground">
                    <span>DB: {tbl.count?.supabase ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="bg-card border border-border rounded-md p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-base">Supabase SQL Schema & Row Level Security (RLS)</h3>
              <p className="text-xs text-muted-foreground">
                Copy and run this script once in your Supabase project SQL Editor to initialize all tables, indexes, and policies.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-sm text-xs font-semibold hover:bg-secondary"
              >
                <span>Open Supabase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleCopySchema}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary/90 shadow-xs"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#14120E] text-white/90 rounded font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            <pre>
{`-- ZEPNEX Marketplace Production SQL Schema
-- 1. Brands Table
create table if not exists public.brands (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  tagline text not null default '',
  logo text not null default '',
  cover_image text not null default '',
  location text not null default '',
  rating numeric(3,1) not null default 0,
  reviews int not null default 0,
  followers int not null default 0,
  product_count int not null default 0,
  description text not null default '',
  verified boolean not null default false,
  website text,
  contact_email text,
  featured boolean not null default true,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Products Table
create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  brand_id text not null references public.brands (id) on delete cascade,
  brand_name text not null default '',
  category text not null default 'Daily Use',
  price numeric(12,2) not null default 0,
  original_price numeric(12,2),
  rating numeric(3,1) not null default 0,
  reviews int not null default 0,
  image text not null default '',
  images text[] default '{}',
  description text not null default '',
  in_stock boolean not null default true,
  badge text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Categories, Reviews, Applications, FAQs, Site Settings tables...`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-card border border-border rounded-md p-5 space-y-6">
          <div>
            <h3 className="font-semibold text-base">Catalog Backup & Restore</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Export your entire marketplace database (brands, products, categories, reviews, FAQs, settings) as a single JSON file, or restore from a previous backup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-border rounded bg-secondary/20 space-y-3">
              <div className="flex items-center gap-2.5">
                <Download className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-sm">Export Full Catalog</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Download all current items as a structured JSON file for safety or transferring between environments.
              </p>
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Backup</span>
              </button>
            </div>

            <div className="p-5 border border-border rounded bg-secondary/20 space-y-3">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-sm">Restore from JSON</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a valid ZEPNEX JSON backup file to restore or replace catalog items.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card text-xs font-semibold rounded-sm hover:bg-secondary cursor-pointer">
                <Upload className="w-4 h-4 text-primary" />
                <span>Select JSON File</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
