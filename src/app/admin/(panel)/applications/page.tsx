'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Store,
  Trash2,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { PageHeader, Field, inputClass } from '@/components/admin/AdminShell';
import DetailDrawer from '@/components/admin/DetailDrawer';
import { useToast } from '@/components/admin/ToastContext';
import { DataService } from '@/lib/supabase/data-service';
import { formatDate } from '@/lib/mappers';
import type { ApplicationRow } from '@/types/database';

export default function AdminApplicationsPage() {
  const { success, error: toastError } = useToast();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await DataService.getApplications();
      setApplications(data);
    } catch {
      toastError('Failed to load applications');
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('zepnex_catalog_updated', handleUpdate);
    return () => window.removeEventListener('zepnex_catalog_updated', handleUpdate);
  }, [loadData]);

  const handleUpdateStatus = async (app: ApplicationRow, status: ApplicationRow['status']) => {
    try {
      await DataService.saveApplication({ ...app, status });
      success('Status Updated', `Application for "${app.brand_name}" set to ${status.toUpperCase()}.`);
      if (selectedApp?.id === app.id) {
        setSelectedApp({ ...selectedApp, status });
      }
      loadData();
    } catch {
      toastError('Update Failed');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setBusy(true);
    try {
      await DataService.saveApplication(selectedApp);
      success('Notes Saved', 'Internal notes updated.');
      loadData();
    } catch {
      toastError('Failed to save notes');
    } finally {
      setBusy(false);
    }
  };

  const handleConvertToBrand = async (app: ApplicationRow) => {
    if (!confirm(`Approve "${app.brand_name}" and automatically create an active storefront brand profile?`)) return;
    setBusy(true);
    try {
      const createdBrand = await DataService.convertApplicationToBrand(app);
      success('Brand Created & Approved!', `Successfully added "${createdBrand.name}" to the live partner brands directory!`);
      setSelectedApp(null);
      loadData();
    } catch {
      toastError('Conversion Failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete application from "${name}"?`)) return;
    try {
      await DataService.deleteApplication(id);
      success('Application Deleted', `Deleted submission from "${name}".`);
      if (selectedApp?.id === id) setSelectedApp(null);
      loadData();
    } catch {
      toastError('Delete Failed');
    }
  };

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return applications;
    return applications.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Slide-out Application Inspector Drawer */}
      {selectedApp && (
        <DetailDrawer
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={selectedApp.brand_name}
          subtitle={`Submitted on ${formatDate(selectedApp.created_at)}`}
          badge={
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                selectedApp.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-300'
                  : selectedApp.status === 'rejected'
                  ? 'bg-red-500/10 text-red-700 border border-red-300'
                  : 'bg-amber-500/10 text-amber-700 border border-amber-300'
              }`}
            >
              {selectedApp.status}
            </span>
          }
          actions={
            <>
              <button
                onClick={() => handleDelete(selectedApp.id, selectedApp.brand_name)}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-sm"
              >
                Delete
              </button>
              {selectedApp.status !== 'approved' && (
                <button
                  onClick={() => handleConvertToBrand(selectedApp)}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-sm hover:bg-emerald-700 shadow-xs"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Approve & Convert to Brand</span>
                </button>
              )}
            </>
          }
        >
          <div className="space-y-5 text-sm">
            {/* Contact Details Card */}
            <div className="p-4 bg-secondary/30 rounded border border-border space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Applicant Details</p>
                <a
                  href={`mailto:${selectedApp.email}?subject=ZEPNEX%20Brand%20Partnership%20-%20${encodeURIComponent(selectedApp.brand_name)}`}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" /> Email Applicant
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Contact Email</span>
                  <span className="font-semibold text-foreground">{selectedApp.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Phone Number</span>
                  <span className="font-semibold text-foreground">{selectedApp.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Category Vertical</span>
                  <span className="font-semibold text-foreground">{selectedApp.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Submission Date</span>
                  <span className="font-semibold text-foreground">{formatDate(selectedApp.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Application Pitch / Message */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Brand Pitch & Message</p>
              <div className="p-3.5 bg-card rounded border border-border text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {selectedApp.message || 'No additional message provided.'}
              </div>
            </div>

            {/* Internal Admin Review Notes */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Internal Review Notes & Checklist</p>
              <textarea
                className={`${inputClass} min-h-24`}
                placeholder="Add private review notes, sample verification status, contract links..."
                value={selectedApp.notes || ''}
                onChange={(e) => setSelectedApp({ ...selectedApp, notes: e.target.value })}
              />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <select
                    className="px-2.5 py-1 border border-border bg-card text-xs rounded-sm focus:outline-none"
                    value={selectedApp.status}
                    onChange={(e) => setSelectedApp({ ...selectedApp, status: e.target.value as ApplicationRow['status'] })}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveNotes}
                  disabled={busy}
                  className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* Header */}
      <PageHeader
        title="Brand Inbound Applications"
        subtitle="Review merchant onboarding requests, manage partner review pipelines, and convert submissions into active brands."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Applications' }]}
      />

      {/* Status Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card p-1.5 rounded-md shadow-xs">
        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: 'All Applications', count: applications.length },
            { key: 'pending', label: 'Pending', count: applications.filter((a) => a.status === 'pending').length },
            { key: 'approved', label: 'Approved', count: applications.filter((a) => a.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: applications.filter((a) => a.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as typeof statusFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                statusFilter === tab.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-card border border-border rounded-md divide-y divide-border overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <Inbox className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <p>No brand applications found in this filter.</p>
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h4 className="font-semibold text-sm text-foreground">{app.brand_name}</h4>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      app.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-700'
                        : app.status === 'rejected'
                        ? 'bg-red-500/10 text-red-700'
                        : 'bg-amber-500/10 text-amber-700'
                    }`}
                  >
                    {app.status}
                  </span>
                  {app.category && (
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.2 rounded bg-secondary">
                      {app.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-primary" /> {app.email}
                  </span>
                  {app.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-primary" /> {app.phone}
                    </span>
                  )}
                  <span>{formatDate(app.created_at)}</span>
                </div>

                {app.message && (
                  <p className="text-xs text-foreground/75 line-clamp-1 italic mt-1">&ldquo;{app.message}&rdquo;</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                {app.status === 'pending' && (
                  <button
                    onClick={() => handleConvertToBrand(app)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve as Brand</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedApp(app)}
                  className="px-3 py-1.5 border border-border bg-card hover:bg-secondary rounded text-xs font-semibold text-foreground transition-colors"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
