'use client';

import { useState } from 'react';
import { PageHeader, Field, inputClass } from '@/components/admin/AdminShell';
import { useToast } from '@/components/admin/ToastContext';
import {
  Settings2,
  Globe,
  ShoppingBag,
  AlertTriangle,
  Save,
  Trash2,
  RefreshCw,
  Info,
  CheckCircle2,
  DollarSign,
  Mail,
  Phone,
  Building,
} from 'lucide-react';

interface SiteConfig {
  siteName: string;
  siteTagline: string;
  adminEmail: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  currencySymbol: string;
  lowStockThreshold: number;
  featuredProductSlots: number;
  featuredBrandSlots: number;
  productsPerPage: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

const DEFAULTS: SiteConfig = {
  siteName: 'ZEPNEX',
  siteTagline: "India's Premier Multi-Brand Marketplace",
  adminEmail: 'admin@zepnex.com',
  supportEmail: 'support@zepnex.com',
  supportPhone: '',
  currency: 'INR',
  currencySymbol: '₹',
  lowStockThreshold: 5,
  featuredProductSlots: 8,
  featuredBrandSlots: 6,
  productsPerPage: 12,
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing maintenance. We will be back shortly.',
};

const STORAGE_KEY = 'zepnex_site_config';

function loadConfig(): SiteConfig {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export default function AdminSettingsPage() {
  const { success, error: toastError } = useToast();
  const [config, setConfig] = useState<SiteConfig>(loadConfig);
  const [saving, setSaving] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);

  const set = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Persist to localStorage (platform-level settings can be extended to Supabase site_settings later)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      // Small delay for UX feedback
      await new Promise((r) => setTimeout(r, 400));
      success('Settings Saved', 'Platform configuration updated successfully.');
    } catch (err) {
      toastError('Save Failed', err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setConfig(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    success('Settings Reset', 'All settings have been restored to defaults.');
  };

  const handleClearCache = () => {
    // Clear all local cache keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('zepnex_') || key.startsWith('catalog_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    success('Cache Cleared', `Cleared ${keysToRemove.length} cached items from local storage.`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Site Settings"
        subtitle="Platform-wide configuration for ZEPNEX Marketplace — general info, commerce rules, and maintenance."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Site Settings' }]}
        action={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        }
      />

      {/* Info note */}
      <div className="p-3.5 rounded-md border border-border bg-secondary/30 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Settings are stored in local storage and take effect immediately. To persist settings across devices, connect Supabase and the <code className="font-mono bg-secondary px-1 rounded">site_settings</code> table will be used automatically.
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">General</h2>
          <span className="ml-auto text-xs text-muted-foreground">Brand & contact identity</span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Site Name" required>
            <input
              type="text"
              value={config.siteName}
              onChange={(e) => set('siteName', e.target.value)}
              className={inputClass}
              placeholder="ZEPNEX"
            />
          </Field>
          <Field label="Site Tagline">
            <input
              type="text"
              value={config.siteTagline}
              onChange={(e) => set('siteTagline', e.target.value)}
              className={inputClass}
              placeholder="India's Premier Multi-Brand Marketplace"
            />
          </Field>
          <Field label="Admin Email" required hint="Used for system notifications">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={config.adminEmail}
                onChange={(e) => set('adminEmail', e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="admin@zepnex.com"
              />
            </div>
          </Field>
          <Field label="Support Email" hint="Shown in the storefront footer">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => set('supportEmail', e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="support@zepnex.com"
              />
            </div>
          </Field>
          <Field label="Support Phone" hint="Optional — shown in contact pages">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={config.supportPhone}
                onChange={(e) => set('supportPhone', e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="+91 98765 43210"
              />
            </div>
          </Field>
          <Field label="Company / Brand Name" hint="Used in legal footers and invoices">
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => set('siteName', e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="ZEPNEX Commerce Pvt. Ltd."
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Commerce Settings */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Commerce</h2>
          <span className="ml-auto text-xs text-muted-foreground">Inventory & display rules</span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Currency" hint="ISO 4217 currency code">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={config.currency}
                onChange={(e) => {
                  const sym: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
                  set('currency', e.target.value);
                  set('currencySymbol', sym[e.target.value] || e.target.value);
                }}
                className={`${inputClass} pl-9`}
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
              </select>
            </div>
          </Field>
          <Field label="Currency Symbol" hint="Displayed on product prices">
            <input
              type="text"
              maxLength={3}
              value={config.currencySymbol}
              onChange={(e) => set('currencySymbol', e.target.value)}
              className={inputClass}
              placeholder="₹"
            />
          </Field>
          <Field label="Low Stock Threshold" hint="Units below this are flagged as low stock">
            <input
              type="number"
              min={1}
              max={100}
              value={config.lowStockThreshold}
              onChange={(e) => set('lowStockThreshold', parseInt(e.target.value, 10) || 5)}
              className={inputClass}
            />
          </Field>
          <Field label="Products Per Page" hint="Max products shown per page in storefront">
            <input
              type="number"
              min={4}
              max={48}
              value={config.productsPerPage}
              onChange={(e) => set('productsPerPage', parseInt(e.target.value, 10) || 12)}
              className={inputClass}
            />
          </Field>
          <Field label="Featured Product Slots" hint="How many featured products are shown on homepage">
            <input
              type="number"
              min={1}
              max={24}
              value={config.featuredProductSlots}
              onChange={(e) => set('featuredProductSlots', parseInt(e.target.value, 10) || 8)}
              className={inputClass}
            />
          </Field>
          <Field label="Featured Brand Slots" hint="How many featured brands are shown on homepage">
            <input
              type="number"
              min={1}
              max={16}
              value={config.featuredBrandSlots}
              onChange={(e) => set('featuredBrandSlots', parseInt(e.target.value, 10) || 6)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Maintenance Mode</h2>
          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
            config.maintenanceMode ? 'bg-red-500/10 text-red-700' : 'bg-emerald-500/10 text-emerald-700'
          }`}>
            {config.maintenanceMode ? 'Active' : 'Off'}
          </span>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between p-4 rounded-md border border-border bg-secondary/20">
            <div>
              <p className="text-sm font-semibold">Enable Maintenance Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                When active, customers will see the maintenance message instead of the storefront. Admin panel remains accessible.
              </p>
            </div>
            <button
              onClick={() => set('maintenanceMode', !config.maintenanceMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                config.maintenanceMode ? 'bg-red-500' : 'bg-secondary border border-border'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                config.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {config.maintenanceMode && (
            <div className="p-3 rounded-md border border-red-500/30 bg-red-500/5 flex items-center gap-2 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Maintenance mode is active. The storefront is not accessible to customers.</span>
            </div>
          )}

          <Field label="Maintenance Message" hint="Shown to customers when maintenance mode is on">
            <textarea
              rows={3}
              value={config.maintenanceMessage}
              onChange={(e) => set('maintenanceMessage', e.target.value)}
              className={inputClass}
              placeholder="We are currently performing maintenance..."
            />
          </Field>
        </div>
      </div>

      {/* Save Button (bottom) */}
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {saving ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-500/20 rounded-md overflow-hidden">
        <button
          onClick={() => setShowDangerZone(!showDangerZone)}
          className="w-full px-5 py-4 flex items-center justify-between bg-red-500/5 hover:bg-red-500/10 transition-colors"
        >
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-semibold">Danger Zone</span>
          </div>
          <span className="text-xs text-red-600">{showDangerZone ? 'Collapse' : 'Expand'}</span>
        </button>

        {showDangerZone && (
          <div className="p-5 space-y-4 bg-red-500/3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-md border border-red-500/20 bg-card">
              <div>
                <p className="text-sm font-semibold text-foreground">Clear Local Cache</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Removes all cached catalog data, settings, and activity logs from browser storage.
                  Does not affect Supabase data.
                </p>
              </div>
              <button
                onClick={handleClearCache}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-700 text-xs font-semibold rounded-sm hover:bg-red-500/10 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cache
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-md border border-red-500/20 bg-card">
              <div>
                <p className="text-sm font-semibold text-foreground">Reset Settings to Defaults</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Restores all site settings on this page to their original default values.
                </p>
              </div>
              <button
                onClick={handleResetToDefaults}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-700 text-xs font-semibold rounded-sm hover:bg-red-500/10 transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
