'use client';

import { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '@/components/admin/AdminShell';
import type { ProfileRow, UserRole } from '@/types/database';
import {
  Users,
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

const ROLE_STYLES: Record<UserRole, { label: string; badge: string }> = {
  admin: { label: 'Super Admin', badge: 'bg-red-500/10 text-red-700 border border-red-500/20' },
  manager: { label: 'Manager', badge: 'bg-amber-500/10 text-amber-700 border border-amber-500/20' },
  customer: { label: 'Customer', badge: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
};

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError('');
    const response = await fetch('/api/admin/users');
    if (!response.ok) {
      setError('Only administrators can manage users. Connect Supabase and ensure your account has the admin role.');
      setLoading(false);
      return;
    }
    setUsers((await response.json()) as ProfileRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, values: { role?: UserRole; disabled?: boolean }) => {
    setUpdating(id);
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...values }),
    });
    if (response.ok) {
      await load();
    } else {
      setError('User update failed. You may not have permission to modify this user.');
    }
    setUpdating(null);
  };

  const filtered = useMemo(() => {
    let result = users;
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.display_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, search, roleFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    managers: users.filter((u) => u.role === 'manager').length,
    disabled: users.filter((u) => u.disabled).length,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Users & Roles"
        subtitle="Manage customer, manager, and administrator access across the platform."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users & Roles' }]}
        action={
          <Link
            href="https://supabase.com/dashboard"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-secondary text-xs font-semibold rounded-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Invite via Supabase
          </Link>
        }
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Super Admins', value: stats.admins, icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-500/10' },
          { label: 'Managers', value: stats.managers, icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          { label: 'Disabled', value: stats.disabled, icon: UserX, color: 'text-slate-500', bg: 'bg-slate-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border border-border rounded-md p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 rounded-md border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-800">{error}</p>
          </div>
          <button onClick={load} className="text-xs text-amber-700 hover:underline flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-card border border-border rounded-md p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3.5 py-2 border border-border rounded-sm bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as UserRole | 'all'); setPage(1); }}
            className="border border-border rounded-sm bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="admin">Super Admin</option>
            <option value="manager">Manager</option>
            <option value="customer">Customer</option>
          </select>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 border border-border rounded-sm hover:bg-secondary transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        ) : paged.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">
              {filtered.length === 0 && users.length > 0 ? 'No users match your search.' : 'No users found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-left border-b border-border">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Updated</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((user) => {
                    const isUpdating = updating === user.id;
                    const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.customer;
                    return (
                      <tr key={user.id} className={`hover:bg-secondary/20 transition-colors ${user.disabled ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {(user.display_name || user.email || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.display_name || 'Unnamed User'}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={user.role}
                            disabled={isUpdating}
                            onChange={(e) => update(user.id, { role: e.target.value as UserRole })}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border focus:outline-none cursor-pointer disabled:opacity-50 ${roleStyle.badge} bg-transparent`}
                          >
                            <option value="customer">Customer</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Super Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            user.disabled
                              ? 'bg-red-500/10 text-red-700'
                              : 'bg-emerald-500/10 text-emerald-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.disabled ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {user.disabled ? 'Disabled' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => update(user.id, { disabled: !user.disabled })}
                            disabled={isUpdating}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-sm border transition-colors disabled:opacity-50 ${
                              user.disabled
                                ? 'border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10'
                                : 'border-red-500/30 text-red-600 hover:bg-red-500/10'
                            }`}
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : user.disabled ? (
                              <><UserCheck className="w-3.5 h-3.5" /> Enable</>
                            ) : (
                              <><UserX className="w-3.5 h-3.5" /> Disable</>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-secondary/20">
                <span className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded border border-border hover:bg-secondary disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 text-xs rounded border transition-colors ${
                        page === i + 1
                          ? 'bg-primary text-white border-primary'
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded border border-border hover:bg-secondary disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground">
        To invite new users or reset passwords, use the{' '}
        <Link href="https://supabase.com/dashboard" target="_blank" className="text-primary hover:underline">
          Supabase Dashboard Authentication section
        </Link>
        . Role changes take effect immediately.
      </p>
    </div>
  );
}
