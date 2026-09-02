'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  ExternalLink,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);

  React.useEffect(() => {
    setMfaRequired(new URLSearchParams(window.location.search).get('error') === 'mfa_required');
  }, []);

  const verifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || !mfaChallengeId) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code: mfaCode });
      if (verifyError) throw verifyError;
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid authenticator code');
    } finally {
      setBusy(false);
    }
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) throw signError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile || !['admin', 'manager'].includes((profile as { role?: string }).role || '')) {
        await supabase.auth.signOut();
        throw new Error('This Supabase user is not an admin yet. Run: update public.profiles set role = \'admin\' where email = \'your-email@example.com\';');
      }

      if ((profile as { role?: string }).role === 'admin') {
        const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assurance?.currentLevel !== 'aal2') {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const factor = factors?.totp?.find((entry) => entry.status === 'verified');
          if (!factor) {
            router.push('/admin/security');
            router.refresh();
            return;
          }
          const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
          if (challengeError) throw challengeError;
          setMfaFactorId(factor.id);
          setMfaChallengeId(challenge.id);
          setBusy(false);
          return;
        }
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
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
            <span className="block text-[9px] uppercase tracking-[0.2em] text-primary font-semibold">Admin Suite</span>
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
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">Admin Access</h1>
          <p className="text-xs text-white/60">
            Sign in to manage products, partner brands, categories, reviews, and Supabase data synchronization.
          </p>
        </div>

        <div className="bg-[#1C1A16] border border-white/10 p-6 sm:p-8 rounded-lg shadow-2xl space-y-6 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#1C1A16] px-3 text-[10px] uppercase tracking-widest text-white/40 font-mono">
              Sign in with Supabase Auth
            </span>
          </div>

          {mfaRequired && <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">Authenticator verification is required for this admin account.</div>}

          {mfaFactorId ? <form onSubmit={verifyMfa} className="space-y-4">
            <div className="space-y-1.5"><label className="block text-xs font-semibold uppercase tracking-wider text-white/70">Authenticator code</label><input inputMode="numeric" pattern="[0-9]{6}" required value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} className="w-full px-3.5 py-2.5 border border-white/10 rounded-sm bg-white/5 text-sm text-white" /></div>
            {error && <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">{error}</div>}
            <button type="submit" disabled={busy} className="w-full py-2.5 bg-primary text-white text-xs font-semibold uppercase tracking-wider rounded-sm disabled:opacity-50">{busy ? 'Verifying...' : 'Verify and continue'}</button>
          </form> : <form onSubmit={handleSupabaseLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">Admin Email</label>
              <input
                type="email"
                required
                placeholder="admin@zepnex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-white/10 rounded-sm bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-white/10 rounded-sm bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !configured}
              className="w-full py-2.5 border border-white/20 bg-white/10 text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-white/15 disabled:opacity-50 transition-colors"
            >
              {!configured ? 'Supabase is not configured' : busy ? 'Authenticating...' : 'Sign in with Password'}
            </button>
          </form>}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-white/40">
        ZEPNEX Multi-Brand Artisan & Premium Commerce · Admin Suite v2.0
      </div>
    </div>
  );
}
