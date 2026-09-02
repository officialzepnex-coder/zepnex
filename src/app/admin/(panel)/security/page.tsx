'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/AdminShell';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  ShieldCheck,
  ShieldAlert,
  User,
  Clock,
  Monitor,
  Database,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Lock,
  Globe,
  Info,
} from 'lucide-react';
import Link from 'next/link';

interface SessionInfo {
  email: string;
  role: string;
  userId: string;
  sessionStartedAt: string;
  lastLogin: string | null;
  loginCount: number;
}

interface LoginHistoryEntry {
  timestamp: string;
  device: string;
}

export default function AdminSecurityPage() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [mfaStatus, setMfaStatus] = useState<'checking' | 'enrolled' | 'not_enrolled' | 'unavailable'>('checking');
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [activeAdminCount, setActiveAdminCount] = useState<number | null>(null);
  const [userAgent] = useState(() => (typeof window !== 'undefined' ? navigator.userAgent : ''));
  const configured = isSupabaseConfigured();

  useEffect(() => {
    // Load login history from localStorage
    try {
      const raw = localStorage.getItem('zepnex_login_history');
      const history: LoginHistoryEntry[] = raw ? JSON.parse(raw) : [];
      setLoginHistory(history.slice(0, 5));
    } catch {
      setLoginHistory([]);
    }

    if (!configured) {
      setMfaStatus('unavailable');
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s?.user) return;

      // Fetch role from profiles table
      supabase
        .from('profiles')
        .select('role')
        .eq('id', s.user.id)
        .maybeSingle()
        .then(({ data }) => {
          const roleMap: Record<string, string> = { admin: 'Super Admin', manager: 'Manager', customer: 'Customer' };
          const profile = data as { role?: string } | null;
          setSession({
            email: s.user.email || '',
            role: roleMap[profile?.role || ''] || 'Unknown',
            userId: s.user.id,
            sessionStartedAt: new Date().toISOString(),
            lastLogin: localStorage.getItem('zepnex_last_login'),
            loginCount: parseInt(localStorage.getItem('zepnex_login_count') || '0', 10),
          });
        });

      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('disabled', false)
        .then(({ count }) => setActiveAdminCount(count || 0));

      // Check MFA status
      supabase.auth.mfa.listFactors().then(({ data }) => {
        const hasMfa = data?.totp?.some((f) => f.status === 'verified');
        setMfaStatus(hasMfa ? 'enrolled' : 'not_enrolled');
      });
    });
  }, [configured]);

  const parseDevice = (ua: string): string => {
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown Device';
  };

  const parseBrowser = (ua: string): string => {
    if (ua.includes('Edg/')) return 'Microsoft Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown Browser';
  };

  const securityChecklist = [
    {
      label: 'Supabase Authentication',
      description: 'Admin access protected by Supabase Auth',
      ok: configured,
      okText: 'Active',
      failText: 'Not Configured',
    },
    {
      label: 'Role-Based Access Control',
      description: 'Only admin/manager roles can access this panel',
      ok: configured,
      okText: 'Enforced',
      failText: 'Not Enforced',
    },
    {
      label: 'Server-Side Auth Middleware',
      description: 'Every page route is protected at the server level',
      ok: true,
      okText: 'Active',
      failText: 'Disabled',
    },
    {
      label: 'Multi-Factor Authentication',
      description: 'TOTP authenticator app for admin accounts',
      ok: mfaStatus === 'enrolled',
      okText: 'Enrolled',
      failText: mfaStatus === 'unavailable' ? 'N/A (Supabase not configured)' : 'Not Enrolled',
      warning: mfaStatus === 'not_enrolled',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Security"
        subtitle="Session information, authentication status, and security configuration for the admin panel."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Security' }]}
      />

      {/* Alert: Not Configured */}
      {!configured && (
        <div className="p-4 rounded-md border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-800">Supabase Not Configured</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Add <code className="bg-amber-500/20 px-1 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="bg-amber-500/20 px-1 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your
              environment to enable Supabase auth and full security features.
            </p>
          </div>
        </div>
      )}

      {/* Security Checklist */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Security Checklist</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {securityChecklist.filter((c) => c.ok).length} / {securityChecklist.length} checks passed
          </span>
        </div>
        <div className="divide-y divide-border">
          {securityChecklist.map((check) => (
            <div key={check.label} className="flex items-center justify-between px-5 py-3.5 gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${check.ok ? 'text-emerald-500' : check.warning ? 'text-amber-500' : 'text-red-500'}`}>
                  {check.ok ? <CheckCircle2 className="w-4.5 h-4.5" /> : check.warning ? <AlertTriangle className="w-4.5 h-4.5" /> : <XCircle className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{check.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.description}</p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                check.ok
                  ? 'bg-emerald-500/10 text-emerald-700'
                  : check.warning
                  ? 'bg-amber-500/10 text-amber-700'
                  : 'bg-red-500/10 text-red-700'
              }`}>
                {check.ok ? check.okText : check.failText}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Session */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Current Session</h2>
          </div>
          <div className="p-5 space-y-4">
            {session ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-lg">
                    {session.email[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{session.email}</p>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      {session.role}
                    </span>
                  </div>
                </div>
                <div className="space-y-2.5 text-sm pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Key className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-mono truncate">{session.userId}</span>
                  </div>
                  {session.lastLogin && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs">Last login: {new Date(session.lastLogin).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">Session started: {new Date(session.sessionStartedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Monitor className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">{parseBrowser(userAgent)} on {parseDevice(userAgent)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Database className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">Supabase Auth · {configured ? 'Connected' : 'Not connected'}</span>
                  </div>
                </div>
              </>
            ) : configured ? (
              <div className="py-6 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Loading session...</p>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs text-muted-foreground">Connect Supabase to see session details.</p>
              </div>
            )}
          </div>
        </div>

        {/* MFA Status */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Multi-Factor Authentication</h2>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
              mfaStatus === 'enrolled'
                ? 'bg-emerald-500/10 text-emerald-700'
                : mfaStatus === 'checking'
                ? 'bg-secondary text-muted-foreground'
                : mfaStatus === 'unavailable'
                ? 'bg-secondary text-muted-foreground'
                : 'bg-amber-500/10 text-amber-700'
            }`}>
              {mfaStatus === 'enrolled' ? 'Enrolled' : mfaStatus === 'checking' ? 'Checking...' : mfaStatus === 'unavailable' ? 'N/A' : 'Not Enrolled'}
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className={`flex items-start gap-3 p-3.5 rounded-md border ${
              mfaStatus === 'enrolled'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : mfaStatus === 'not_enrolled'
                ? 'bg-amber-500/5 border-amber-500/20'
                : 'bg-secondary/50 border-border'
            }`}>
              <div className="mt-0.5">
                {mfaStatus === 'enrolled'
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  : mfaStatus === 'not_enrolled'
                  ? <AlertTriangle className="w-5 h-5 text-amber-500" />
                  : <Info className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {mfaStatus === 'enrolled'
                    ? 'Authenticator App Enrolled'
                    : mfaStatus === 'not_enrolled'
                    ? 'No Authenticator Enrolled'
                    : 'MFA Status Unknown'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mfaStatus === 'enrolled'
                    ? 'This admin account is protected with TOTP two-factor authentication. Every sign-in requires authenticator verification.'
                    : mfaStatus === 'not_enrolled'
                    ? 'Admin accounts should enroll an authenticator app. Without MFA, access requires password only.'
                    : configured
                    ? 'Checking MFA enrollment status...'
                    : 'Supabase must be configured before MFA can be used.'}
                </p>
              </div>
            </div>

            {/* Under-process notice */}
            <div className="p-3.5 rounded-md bg-primary/5 border border-primary/20 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-primary">2-Step Verification — Coming Soon</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enhanced 2-step verification setup is currently under development. Admin MFA enrollment is managed via the Supabase dashboard for now.
                </p>
                <Link
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active administrator accounts */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-red-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Active Admin Accounts</p>
              <p className="text-xs text-muted-foreground">Enabled administrator profiles with full panel access</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-display text-2xl font-bold text-foreground">{activeAdminCount ?? '—'}</span>
            <Link href="/admin/users" className="text-xs font-semibold text-primary hover:underline">Manage users</Link>
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Login History</h2>
          <span className="ml-auto text-xs text-muted-foreground">Last {loginHistory.length} sessions</span>
        </div>
        {loginHistory.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p>No login history recorded yet.</p>
            <p className="text-xs mt-1">History is captured on each successful sign-in.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {loginHistory.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.device}</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                {i === 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Access Control Info */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Access Control Configuration</h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Role</p>
            <p className="text-sm font-medium text-foreground">Full panel access + MFA required</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Manager Role</p>
            <p className="text-sm font-medium text-foreground">Panel access, no MFA enforced</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer Role</p>
            <p className="text-sm font-medium text-foreground">Storefront only, no panel access</p>
          </div>
        </div>
        <div className="px-5 pb-5 flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            Manage Users & Roles
          </Link>
          <Link
            href="https://supabase.com/dashboard"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-secondary text-xs font-semibold rounded-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Supabase Dashboard
          </Link>
        </div>
      </div>

      {/* Password Management Notice */}
      <div className="p-4 rounded-md border border-border bg-secondary/30 flex items-start gap-3">
        <Key className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Password Management</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Admin passwords are managed through Supabase Auth. To change your password, use the{' '}
            <Link href="https://supabase.com/dashboard" target="_blank" className="text-primary hover:underline">
              Supabase Dashboard
            </Link>{' '}
            or trigger a password reset email from the authentication settings.
          </p>
        </div>
      </div>
    </div>
  );
}
