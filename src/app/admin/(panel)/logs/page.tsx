'use client';

import { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '@/components/admin/AdminShell';
import type { AuditLogRow } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  AlertTriangle,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Database,
  Info,
} from 'lucide-react';

const ACTION_STYLES: Record<string, { label: string; badge: string; icon: React.ElementType }> = {
  INSERT: { label: 'Create', badge: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20', icon: Plus },
  UPDATE: { label: 'Update', badge: 'bg-blue-500/10 text-blue-700 border border-blue-500/20', icon: Pencil },
  DELETE: { label: 'Delete', badge: 'bg-red-500/10 text-red-700 border border-red-500/20', icon: Trash2 },
  SYSTEM: { label: 'System', badge: 'bg-slate-500/10 text-slate-600 border border-slate-500/20', icon: Database },
};

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    setError('');
    createClient()
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError(queryError.message);
        } else {
          setLogs((data || []) as AuditLogRow[]);
        }
        setLoading(false);
      });
  };

  useEffect(() => { fetchLogs(); }, []);

  const entityTypes = useMemo(() => {
    const types = new Set(logs.map((l) => l.entity_type).filter(Boolean));
    return Array.from(types).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    let result = logs;
    if (actionFilter !== 'all') {
      result = result.filter((l) => l.action?.toUpperCase() === actionFilter);
    }
    if (entityFilter !== 'all') {
      result = result.filter((l) => l.entity_type === entityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.action?.toLowerCase().includes(q) ||
          l.entity_type?.toLowerCase().includes(q) ||
          l.entity_id?.toLowerCase().includes(q) ||
          l.actor_id?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, actionFilter, entityFilter, search]);

  const exportCsv = () => {
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Actor ID'];
    const rows = filtered.map((l) => [
      new Date(l.created_at).toISOString(),
      l.action || '',
      l.entity_type || '',
      l.entity_id || '',
      l.actor_id || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: logs.length,
    inserts: logs.filter((l) => l.action?.toUpperCase() === 'INSERT').length,
    updates: logs.filter((l) => l.action?.toUpperCase() === 'UPDATE').length,
    deletes: logs.filter((l) => l.action?.toUpperCase() === 'DELETE').length,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Audit Logs"
        subtitle="Full history of security and administrative changes across the platform."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Audit Logs' }]}
        action={
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-secondary text-xs font-semibold rounded-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        }
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: stats.total, color: 'text-foreground', bg: 'bg-secondary' },
          { label: 'Creates', value: stats.inserts, color: 'text-emerald-700', bg: 'bg-emerald-500/10' },
          { label: 'Updates', value: stats.updates, color: 'text-blue-700', bg: 'bg-blue-500/10' },
          { label: 'Deletes', value: stats.deletes, color: 'text-red-700', bg: 'bg-red-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-md border border-border p-4 ${stat.bg}`}>
            <p className={`font-display text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 rounded-md border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Unable to load audit logs</p>
            <p className="text-xs text-amber-700 mt-0.5">{error}. Make sure the Supabase schema migration has been applied to create the <code className="font-mono bg-amber-500/20 px-1 rounded">audit_logs</code> table.</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-md p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by action, entity, actor ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 border border-border rounded-sm bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="border border-border rounded-sm bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">All Actions</option>
            <option value="INSERT">Create (INSERT)</option>
            <option value="UPDATE">Update (UPDATE)</option>
            <option value="DELETE">Delete (DELETE)</option>
          </select>
          {entityTypes.length > 0 && (
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="border border-border rounded-sm bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Entities</option>
              {entityTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 border border-border rounded-sm hover:bg-secondary transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Showing count */}
      {!loading && (
        <p className="text-xs text-muted-foreground px-1">
          Showing {filtered.length} of {logs.length} events
        </p>
      )}

      {/* Log Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading audit logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">
              {logs.length === 0
                ? 'No audit events recorded yet. Events are logged automatically as admins make changes.'
                : 'No events match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((log) => {
              const actionKey = log.action?.toUpperCase() as string;
              const style = ACTION_STYLES[actionKey] || ACTION_STYLES.SYSTEM;
              const Icon = style.icon;
              const isExpanded = expandedId === log.id;
              const hasDiff = log.before_data || log.after_data;

              return (
                <div key={log.id} className="hover:bg-secondary/20 transition-colors">
                  <div
                    className={`flex items-start justify-between gap-4 px-5 py-4 ${hasDiff ? 'cursor-pointer' : ''}`}
                    onClick={() => hasDiff && setExpandedId(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${style.badge}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                            {style.label}
                          </span>
                          <span className="text-sm font-semibold text-foreground">{log.entity_type || 'System'}</span>
                          {log.entity_id && (
                            <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                              #{log.entity_id.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                        {log.actor_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Actor: <span className="font-mono">{log.actor_id.slice(0, 12)}...</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <time title={new Date(log.created_at).toLocaleString()}>
                            {getRelativeTime(log.created_at)}
                          </time>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {new Date(log.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {hasDiff && (
                        <div className="text-muted-foreground">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON Diff */}
                  {isExpanded && hasDiff && (
                    <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {log.before_data && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-md p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1.5">
                            <Trash2 className="w-3 h-3" /> Before
                          </p>
                          <pre className="text-xs text-foreground font-mono overflow-x-auto whitespace-pre-wrap break-all">
                            {JSON.stringify(log.before_data, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.after_data && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-md p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                            <Plus className="w-3 h-3" /> After
                          </p>
                          <pre className="text-xs text-foreground font-mono overflow-x-auto whitespace-pre-wrap break-all">
                            {JSON.stringify(log.after_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schema note */}
      {!loading && logs.length === 0 && !error && (
        <div className="p-4 rounded-md border border-border bg-secondary/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Audit logs are populated by Supabase database triggers. Apply the <code className="font-mono bg-secondary px-1 rounded">audit_logs</code> schema migration to start capturing events.
          </p>
        </div>
      )}
    </div>
  );
}
