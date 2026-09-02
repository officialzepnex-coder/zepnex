'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, ExternalLink, LockKeyhole, Settings2 } from 'lucide-react';

export default function AdminSetupPage() {
  return (
    <main className="min-h-screen bg-[#14120E] px-4 py-10 text-white sm:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary font-display font-bold shadow-md shadow-primary/30">
            Z
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-wider">ZEPNEX</span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">Admin Suite</span>
          </div>
        </div>

        <section className="space-y-6 rounded-lg border border-white/10 bg-[#1C1A16] p-6 shadow-2xl sm:p-8">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Admin setup required</p>
            <h1 className="font-display text-3xl font-bold">Supabase is not configured</h1>
            <p className="text-sm leading-relaxed text-white/60">
              Admin access is locked until Supabase Auth credentials are available. No local fallback access is enabled.
            </p>
          </div>

          <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-4 text-xs text-white/70">
            <p className="flex items-center gap-2 font-semibold text-white"><Settings2 className="h-4 w-4 text-primary" /> Required environment variables</p>
            <code className="block rounded bg-black/20 px-3 py-2 font-mono text-[11px] leading-6 text-white/60">
              NEXT_PUBLIC_SUPABASE_URL<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            <p>Add both values to <code className="rounded bg-white/10 px-1 font-mono">.env.local</code>, then restart the Next.js server.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="https://supabase.com/dashboard" target="_blank" className="flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold hover:bg-primary/90">
              Open Supabase Dashboard <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link href="/admin/login" className="flex items-center justify-center gap-2 rounded-sm border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/5 hover:text-white">
              Return to sign in <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p className="flex items-start gap-2 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/35">
            <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Supabase Auth and server-side role checks protect every admin route.
          </p>
        </section>
      </div>
    </main>
  );
}
