'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Edit2, Image, Plus, Trash2, Users, X } from 'lucide-react';
import { PageHeader, Field, inputClass } from '@/components/admin/AdminShell';
import { useToast } from '@/components/admin/ToastContext';
import { DataService } from '@/lib/supabase/data-service';
import type { TeamMemberRow } from '@/types/database';

const emptyMember: Partial<TeamMemberRow> = {
  name: '',
  role: '',
  image: '',
  bio: '',
  published: true,
  sort_order: 1,
};

export default function AdminTeamPage() {
  const { success, error: toastError } = useToast();
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [form, setForm] = useState<Partial<TeamMemberRow>>(emptyMember);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setMembers(await DataService.getTeamMembers());
    } catch {
      toastError('Failed to load team members');
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('zepnex_catalog_updated', handleUpdate);
    return () => window.removeEventListener('zepnex_catalog_updated', handleUpdate);
  }, [loadData]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyMember, sort_order: members.length + 1 });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name?.trim() || !form.role?.trim()) return;
    setBusy(true);
    try {
      await DataService.saveTeamMember({ ...form, id: editingId || undefined });
      success(editingId ? 'Team member updated' : 'Team member added', 'The storefront team page is now up to date.');
      resetForm();
      await loadData();
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Failed to save team member');
    } finally {
      setBusy(false);
    }
  };

  const edit = (member: TeamMemberRow) => {
    setEditingId(member.id);
    setForm(member);
  };

  const remove = async (member: TeamMemberRow) => {
    if (!confirm(`Delete ${member.name} from the team page?`)) return;
    try {
      await DataService.deleteTeamMember(member.id);
      success('Team member deleted', `${member.name} was removed from the storefront.`);
      if (editingId === member.id) resetForm();
      await loadData();
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Failed to delete team member');
    }
  };

  const togglePublished = async (member: TeamMemberRow) => {
    try {
      await DataService.saveTeamMember({ ...member, published: !member.published });
      await loadData();
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Failed to update visibility');
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Team Members"
        subtitle="Manage the people and roles displayed on the public team page."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Team' }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 rounded-md border border-border bg-card p-4 shadow-xs">
              <img src={member.image} alt="" className="h-16 w-16 shrink-0 rounded-sm object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{member.name}</p>
                <p className="text-xs font-medium text-primary">{member.role}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{member.bio}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => togglePublished(member)} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${member.published ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' : 'border-border text-muted-foreground'}`}>
                  {member.published ? 'Live' : 'Hidden'}
                </button>
                <button onClick={() => edit(member)} className="rounded p-1.5 text-primary hover:bg-secondary" title="Edit team member" aria-label={`Edit ${member.name}`}><Edit2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(member)} className="rounded p-1.5 text-red-600 hover:bg-red-50" title="Delete team member" aria-label={`Delete ${member.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={save} className="h-fit space-y-4 rounded-md border border-border bg-card p-5 shadow-xs lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" />{editingId ? 'Edit Team Member' : 'Add Team Member'}</h2>
            {editingId && <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground" title="Cancel editing" aria-label="Cancel editing"><X className="h-4 w-4" /></button>}
          </div>
          <Field label="Name" required><input required className={inputClass} value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Role" required><input required className={inputClass} value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
          <Field label="Photo URL"><div className="flex items-center gap-2"><Image className="h-4 w-4 shrink-0 text-muted-foreground" /><input className={inputClass} value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div></Field>
          <Field label="Bio"><textarea className={`${inputClass} min-h-24`} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Order"><input type="number" min="1" className={inputClass} value={form.sort_order || 1} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></Field>
            <label className="flex items-end gap-2 pb-2 text-xs"><input type="checkbox" checked={form.published ?? true} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" /> Publish</label>
          </div>
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50"><Plus className="h-4 w-4" />{busy ? 'Saving...' : editingId ? 'Save Changes' : 'Add Member'}</button>
        </form>
      </div>
    </div>
  );
}
