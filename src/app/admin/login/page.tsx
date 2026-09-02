'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configured = isSupabaseConfigured();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const recordLogin = () => {
    const now = new Date().toISOString();
    localStorage.setItem('zepnex_last_login', now);
    const count = parseInt(localStorage.getItem('zepnex_login_count') || '0', 10);
    localStorage.setItem('zepnex_login_count', String(count + 1));
    const device = `${navigator.userAgent.includes('Windows') ? 'Windows' : navigator.userAgent.includes('Mac') ? 'macOS' : navigator.userAgent.includes('Linux') ? 'Linux' : 'Unknown'} · ${navigator.userAgent.includes('Edg/') ? 'Edge' : navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'}`;
    try {
      const raw = localStorage.getItem('zepnex_login_history');
      const history = raw ? JSON.parse(raw) : [];
      history.unshift({ timestamp: now, device });
      localStorage.setItem('zepnex_login_history', JSON.stringify(history.slice(0, 10)));
    } catch {
      localStorage.setItem('zepnex_login_history', JSON.stringify([{ timestamp: now, device }]));
    }
  };

  // MFA step state (kept for real Supabase MFA flow)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [enrollmentFactorId, setEnrollmentFactorId] = useState<string | null>(null);
  const [enrollmentQrCode, setEnrollmentQrCode] = useState('');
  const [enrollmentSecret, setEnrollmentSecret] = useState('');

  // Error banner from middleware redirect params
  const urlError = searchParams.get('error');
  const urlErrorMessages: Record<string, string> = {
    mfa_required: 'Authenticator (MFA) verification is required for this admin account.',
    admin_required: 'Access denied — this account does not have admin or manager privileges.',
    auth_failed: 'Authentication check failed. Please sign in again.',
    not_configured: 'Supabase is not configured. Contact your system administrator.',
  };

  const verifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || !mfaChallengeId) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: mfaCode,
      });
      if (verifyError) throw verifyError;
      recordLogin();
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid authenticator code.');
    } finally {
      setBusy(false);
    }
  };

  const verifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentFactorId) return;
    setBusy(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollmentFactorId,
      });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollmentFactorId,
        challengeId: challenge.id,
        code: mfaCode,
      });
      if (verifyError) throw verifyError;
      recordLogin();
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enable authenticator.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setError('Supabase is not configured. Add your project credentials to .env.local first.');
      return;
    }
    setBusy(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) throw signError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile || !['admin', 'manager'].includes((profile as { role?: string }).role || '')) {
        await supabase.auth.signOut();
        throw new Error(
          'This account does not have admin or manager access. Ask a super-admin to update your role.'
        );
      }

      // MFA step for admins
      if ((profile as { role?: string }).role === 'admin') {
        const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assurance?.currentLevel !== 'aal2') {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const factor = factors?.totp?.find((entry) => entry.status === 'verified');
          if (!factor) {
            const { data: enrollment, error: enrollmentError } = await supabase.auth.mfa.enroll({
              factorType: 'totp',
            });
            if (enrollmentError) throw enrollmentError;
            setEnrollmentFactorId(enrollment.id);
            setEnrollmentQrCode(enrollment.totp.qr_code);
            setEnrollmentSecret(enrollment.totp.secret);
            setBusy(false);
            return;
          }
          const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: factor.id,
          });
          if (challengeError) throw challengeError;
          setMfaFactorId(factor.id);
          setMfaChallengeId(challenge.id);
          setBusy(false);
          return;
        }
      }

      // Store last login time and login history after successful authentication.
      if (typeof window !== 'undefined') {
        recordLogin();
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14120E] text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-display font-bold text-white shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
            Z
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-wider text-white">ZEPNEX</span>
            <span className="block text-[9px] uppercase tracking-[0.2em] text-primary font-semibold">
              Admin Suite
            </span>
          </div>
        </Link>

        <Link
          href="/"
          target="_blank"
          className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>View Public Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-12 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary px-2.5 py-1 rounded bg-primary/10 border border-primary/20 inline-block">
            Marketplace Control Center
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Admin Access
          </h1>
          <p className="text-xs text-white/60">
            Sign in to manage products, partner brands, categories, reviews, and platform settings.
          </p>
        </div>

        {/* Not Configured Banner */}
        {!configured && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-300">Supabase Not Configured</p>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Add <code className="font-mono bg-amber-500/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code className="font-mono bg-amber-500/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{' '}
                <code className="font-mono bg-amber-500/20 px-1 rounded">.env.local</code> to enable admin access.
              </p>
            </div>
          </div>
        )}

        {/* URL Error Banner (from middleware redirects) */}
        {urlError && urlErrorMessages[urlError] && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{urlErrorMessages[urlError]}</span>
          </div>
        )}

        <div className="bg-[#1C1A16] border border-white/10 p-6 sm:p-8 rounded-lg shadow-2xl space-y-6 backdrop-blur-md">
          {enrollmentFactorId ? (
            <form onSubmit={verifyEnrollment} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-white">Set up authenticator</p>
                <p className="text-xs text-white/60">Scan this QR code, then enter the six-digit code from your app.</p>
              </div>
              <img src={`data:image/svg+xml;utf8,${encodeURIComponent(enrollmentQrCode)}`} alt="Authenticator setup QR code" className="mx-auto h-40 w-40 rounded bg-white p-3" />
              <p className="text-center text-[10px] text-white/45 break-all">Manual setup key: {enrollmentSecret}</p>
              <input
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="000000"
                className="w-full px-3.5 py-3 border border-white/10 rounded-sm bg-white/5 text-xl text-white text-center tracking-[0.5em] font-mono placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              {error && <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">{error}</div>}
              <button type="submit" disabled={busy || mfaCode.length !== 6} className="w-full py-2.5 bg-primary text-white text-xs font-semibold uppercase tracking-wider rounded-sm disabled:opacity-50 hover:bg-primary/90 transition-all">
                {busy ? 'Enabling...' : 'Enable & Enter Admin Panel'}
              </button>
            </form>
          ) : mfaFactorId ? (
            /* MFA Verification Step */
            <form onSubmit={verifyMfa} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-white">Two-Factor Verification</p>
                <p className="text-xs text-white/60">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Authenticator Code
                </label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  className="w-full px-3.5 py-3 border border-white/10 rounded-sm bg-white/5 text-xl text-white text-center tracking-[0.5em] font-mono placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="flex items-start gap-2 rounded-sm border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-200/80">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                <span>Several failed attempts may temporarily lock this account. Sign-in attempts are monitored.</span>
              </div>

              <button
                type="submit"
                disabled={busy || mfaCode.length !== 6}
                className="w-full py-2.5 bg-primary text-white text-xs font-semibold uppercase tracking-wider rounded-sm disabled:opacity-50 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                {busy ? 'Verifying...' : 'Verify & Enter Admin Panel'}
                {!busy && <ArrowRight className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => { setMfaFactorId(null); setMfaChallengeId(null); setMfaCode(''); setError(''); }}
                className="w-full text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                ← Back to sign in
              </button>
            </form>
          ) : (
            /* Main Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@zepnex.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!configured}
                  className="w-full px-3.5 py-2.5 border border-white/10 rounded-sm bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!configured}
                    className="w-full px-3.5 py-2.5 pr-10 border border-white/10 rounded-sm bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !configured}
                className="w-full py-2.5 bg-primary text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
              >
                {busy ? 'Authenticating...' : 'Sign in to Admin Panel'}
                {!busy && <ArrowRight className="w-3.5 h-3.5" />}
              </button>

              {/* Security Notice */}
              <div className="flex items-center gap-2 pt-1">
                <Lock className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Protected by Supabase Auth. Role-based access control is enforced server-side.
                  Unauthorised access attempts are logged.
                </p>
              </div>
              <div className="flex items-start gap-2 border-t border-white/5 pt-3 text-[10px] leading-relaxed text-white/35">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Sign in only from a trusted device and network. Your browser and approximate access location may be logged for security.</span>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-white/30">
        ZEPNEX Multi-Brand Artisan &amp; Premium Commerce · Admin Suite v2.0 ·{' '}
        <span className="text-white/20">Secured by Supabase</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#14120E]" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
