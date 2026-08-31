'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Server,
  Database,
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
      if (!profile || (profile as { role?: string }).role !== 'admin') {
        // If not explicit admin in DB, allow dev login or show notice
        console.warn('User profile does not have role=admin yet.');
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = () => {
    // Instant dev/demo bypass into Admin Suite
    if (typeof window !== 'undefined') {
      localStorage.setItem('zepnex_demo_admin_active', 'true');
    }
    router.push('/admin');
    router.refresh();
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
          {/* 1-Click Demo / Test Admin Button */}
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-md space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-4 h-4" /> Quick Preview Access
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-white font-semibold">
                Instant Access
              </span>
            </div>
            <p className="text-xs text-white/75 leading-relaxed">
              Explore the fully editable admin suite, test CRUD operations, and sync sample data in interactive demo mode.
            </p>
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 bg-primary text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              <span>Continue as Demo Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#1C1A16] px-3 text-[10px] uppercase tracking-widest text-white/40 font-mono">
              Or Sign in with Supabase Auth
            </span>
          </div>

          {/* Supabase Password Form */}
          <form onSubmit={handleSupabaseLogin} className="space-y-4">
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
              disabled={busy}
              className="w-full py-2.5 border border-white/20 bg-white/10 text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-white/15 disabled:opacity-50 transition-colors"
            >
              {busy ? 'Authenticating...' : 'Sign in with Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-white/40">
        ZEPNEX Multi-Brand Artisan & Premium Commerce · Admin Suite v2.0
      </div>
    </div>
  );
}
