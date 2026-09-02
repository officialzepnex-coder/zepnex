'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/AdminShell';
import type { ProfileRow, UserRole } from '@/types/database';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    const response = await fetch('/api/admin/users');
    if (!response.ok) { setError('Only administrators can manage users.'); return; }
    setUsers(await response.json() as ProfileRow[]);
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, values: { role?: UserRole; disabled?: boolean }) => {
    const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...values }) });
    if (response.ok) await load();
    else setError('User update failed.');
  };

  return <div className="space-y-6 max-w-6xl">
    <PageHeader title="Users & Roles" subtitle="Manage customer, manager, and administrator access." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users & Roles' }]} />
    {error && <p className="p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">{error}</p>}
    <div className="bg-card border border-border rounded-md overflow-x-auto">
      <table className="w-full text-sm"><thead className="bg-secondary/40 text-left"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody className="divide-y divide-border">
        {users.map((user) => <tr key={user.id}><td className="p-4"><p className="font-medium">{user.display_name || 'Unnamed user'}</p><p className="text-xs text-muted-foreground">{user.email}</p></td><td className="p-4"><select value={user.role} onChange={(event) => update(user.id, { role: event.target.value as UserRole })} className="border border-border rounded-sm bg-background px-2 py-1 text-sm"><option value="customer">Customer</option><option value="manager">Manager</option><option value="admin">Admin</option></select></td><td className="p-4">{user.disabled ? 'Disabled' : 'Active'}</td><td className="p-4"><button onClick={() => update(user.id, { disabled: !user.disabled })} className="text-primary hover:underline">{user.disabled ? 'Enable' : 'Disable'}</button></td></tr>)}
      </tbody></table>
      {users.length === 0 && !error && <p className="p-8 text-center text-muted-foreground">Loading users...</p>}
    </div>
  </div>;
}
