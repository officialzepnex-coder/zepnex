'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Package,
  MessageSquareText,
  Inbox,
  HelpCircle,
  Tags,
  PanelsTopLeft,
  LogOut,
  ExternalLink,
  Search,
  Plus,
  Database,
  Bell,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  Activity,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isDemoAdminMode, isSupabaseConfigured } from '@/lib/supabase/config';
import { ToastProvider, useToast } from './ToastContext';
import GlobalSearchModal from './GlobalSearchModal';
import { DataService } from '@/lib/supabase/data-service';
import type { ActivityLog } from '@/types/database';

interface NavGroup {
  group: string;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    isSync?: boolean;
  }[];
}

function AdminShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { info } = useToast();

  const [email, setEmail] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{
    ok: boolean;
    isFallback: boolean;
    message: string;
  }>({
    ok: true,
    isFallback: !isSupabaseConfigured(),
    message: isSupabaseConfigured() ? 'Checking Supabase...' : 'Local Cache Mode',
  });

  const loadNavData = React.useCallback(async () => {
    try {
      const [apps, status] = await Promise.all([
        DataService.getApplications(),
        DataService.checkConnection(),
      ]);
      setPendingCount(apps.filter((a) => a.status === 'pending').length);
      setConnectionStatus(status);
      setLogs(DataService.getLogs().slice(0, 8));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadNavData();

    if (isSupabaseConfigured() && !isDemoAdminMode()) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) setEmail(data.user.email);
        else setEmail('admin@zepnex.com');
      }).catch(() => setEmail('admin@zepnex.com'));
    } else {
      setEmail('demo-admin@zepnex.com');
    }

    const handleUpdate = () => loadNavData();
    window.addEventListener('zepnex_catalog_updated', handleUpdate);

    // Global Cmd+K / Ctrl+K shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('zepnex_catalog_updated', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loadNavData]);

  const signOut = async () => {
    if (isSupabaseConfigured() && !isDemoAdminMode()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    localStorage.removeItem('zepnex_demo_admin_active');
    document.cookie = 'zepnex_demo_admin_active=; path=/; max-age=0; SameSite=Lax';
    router.push('/admin/login');
    router.refresh();
  };

  const navGroups: NavGroup[] = [
    {
      group: 'OVERVIEW',
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/sync', label: 'Database & Sync', icon: Database, isSync: true },
      ],
    },
    {
      group: 'CATALOG & INVENTORY',
      items: [
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/brands', label: 'Partner Brands', icon: Store },
        { href: '/admin/categories', label: 'Categories', icon: Tags },
      ],
    },
    {
      group: 'ENGAGEMENT',
      items: [
        { href: '/admin/applications', label: 'Applications', icon: Inbox, badge: pendingCount > 0 ? pendingCount : undefined },
        { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareText },
        { href: '/admin/faqs', label: 'FAQs & Help', icon: HelpCircle },
      ],
    },
    {
      group: 'STOREFRONT',
      items: [
        { href: '/admin/content', label: 'Homepage Content', icon: PanelsTopLeft },
        { href: '/admin/team', label: 'Team Members', icon: Users },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-foreground font-sans selection:bg-primary/20">
      {/* Global Cmd+K Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Desktop Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#2A2620] bg-[#14120E] text-white lg:flex lg:flex-col shadow-xl">
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-display font-bold text-white shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
              Z
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-wider text-white">ZEPNEX</span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-primary font-semibold">Admin Suite</span>
            </div>
          </Link>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono">v2.0</span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.group}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all group ${
                        active
                          ? 'bg-primary text-white shadow-sm shadow-primary/20'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-white' : item.isSync ? 'text-amber-400' : 'text-white/60'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          active ? 'bg-white text-primary' : 'bg-primary text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Database Status Chip & Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0F0E0B]/80 space-y-3">
          <Link
            href="/admin/sync"
            className={`flex items-center justify-between p-2.5 rounded-md border text-xs transition-colors ${
              connectionStatus.ok && !connectionStatus.isFallback
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-300 hover:border-amber-500/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                connectionStatus.ok && !connectionStatus.isFallback ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className="font-medium truncate max-w-[140px]">
                {connectionStatus.ok && !connectionStatus.isFallback ? 'Supabase Live' : 'Local Cache (Demo)'}
              </span>
            </div>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16 gap-3">
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md hover:bg-secondary text-foreground"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="font-display font-bold text-lg">ZEPNEX</span>
            </div>

            {/* Universal Search Bar Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex-1 max-w-md hidden sm:flex items-center justify-between px-3.5 py-2 rounded-md border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/40 text-muted-foreground text-xs transition-all shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                <span>Search products, brands, settings...</span>
              </div>
              <kbd className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-card border border-border">
                ⌘K
              </kbd>
            </button>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden p-2 rounded-md hover:bg-secondary text-foreground"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Quick Add Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setQuickAddOpen(!quickAddOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>

                {quickAddOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setQuickAddOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-xl py-1 z-50 animate-fade-in text-sm">
                      <Link
                        href="/admin/products/new"
                        onClick={() => setQuickAddOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-secondary text-foreground"
                      >
                        <Package className="w-4 h-4 text-primary" />
                        <span>Add Product</span>
                      </Link>
                      <Link
                        href="/admin/brands/new"
                        onClick={() => setQuickAddOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-secondary text-foreground"
                      >
                        <Store className="w-4 h-4 text-primary" />
                        <span>Add Brand</span>
                      </Link>
                      <Link
                        href="/admin/categories"
                        onClick={() => setQuickAddOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-secondary text-foreground"
                      >
                        <Tags className="w-4 h-4 text-primary" />
                        <span>Add Category</span>
                      </Link>
                      <Link
                        href="/admin/faqs"
                        onClick={() => setQuickAddOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-secondary text-foreground"
                      >
                        <HelpCircle className="w-4 h-4 text-primary" />
                        <span>Add FAQ</span>
                      </Link>
                      <Link
                        href="/admin/reviews"
                        onClick={() => setQuickAddOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-secondary text-foreground"
                      >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Add Review</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Notifications Center */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground relative transition-colors"
                  aria-label="Notifications and activity"
                >
                  <Bell className="w-4 h-4" />
                  {logs.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-md shadow-2xl z-50 animate-fade-in overflow-hidden">
                      <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-xs uppercase tracking-wider">Recent Activity</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{logs.length} events</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-border">
                        {logs.length === 0 ? (
                          <div className="p-6 text-center text-xs text-muted-foreground">No recent events logged.</div>
                        ) : (
                          logs.map((log) => (
                            <div key={log.id} className="p-3 text-xs hover:bg-secondary/40 transition-colors">
                              <p className="font-medium text-foreground">{log.title}</p>
                              {log.details && <p className="text-muted-foreground mt-0.5">{log.details}</p>}
                              <p className="text-[10px] text-muted-foreground/60 mt-1">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar Info */}
              <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-border">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                  {email ? email[0].toUpperCase() : 'A'}
                </div>
                <div className="text-left leading-tight hidden xl:block">
                  <p className="text-xs font-semibold truncate max-w-[120px]">{email}</p>
                  <span className="text-[10px] text-muted-foreground">Administrator</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-72 bg-[#14120E] text-white p-5 flex flex-col shadow-2xl animate-slide-in-left">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-primary flex items-center justify-center font-display font-bold text-white">
                    Z
                  </div>
                  <span className="font-display font-bold text-lg">ZEPNEX Admin</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-4 overflow-y-auto">
                {navGroups.map((group) => (
                  <div key={group.group}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1.5 px-2">
                      {group.group}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                              active ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-primary">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <Link href="/" target="_blank" className="flex items-center gap-2 text-white/70 hover:text-white">
                  <ExternalLink className="w-4 h-4" /> View Storefront
                </Link>
                <button onClick={signOut} className="flex items-center gap-2 text-red-400 hover:text-red-300">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminShellContent>{children}</AdminShellContent>
    </ToastProvider>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              {b.href ? (
                <Link href={b.href} className="hover:text-primary transition-colors">
                  {b.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{subtitle}</p> : null}
        </div>
        {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </div>
      {children}
      {hint ? <span className="block text-[11px] text-muted-foreground leading-normal">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  'w-full px-3.5 py-2.5 border border-border rounded-sm bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors';
