'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/AdminShell';
import type { AuditLogRow } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    createClient().from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100).then(({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      else setLogs((data || []) as AuditLogRow[]);
    });
  }, []);

  return <div className="space-y-6 max-w-6xl"><PageHeader title="Audit Logs" subtitle="Trace security and administrative changes in the database." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Audit Logs' }]} />
    {error ? <p className="p-4 border border-amber-200 bg-amber-50 text-sm text-amber-800">{error}. Apply the Supabase schema migration to enable audit logs.</p> : <div className="bg-card border border-border rounded-md divide-y divide-border">{logs.map((log) => <div key={log.id} className="p-4 flex items-start justify-between gap-4"><div><p className="font-medium">{log.action} <span className="text-muted-foreground">{log.entity_type}</span></p><p className="text-xs text-muted-foreground">{log.entity_id || 'System event'}</p></div><time className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</time></div>)}{logs.length === 0 && <p className="p-8 text-center text-muted-foreground">No audit events recorded yet.</p>}</div>}
  </div>;
}
