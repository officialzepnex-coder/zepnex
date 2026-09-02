'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/AdminShell';
import { createClient } from '@/lib/supabase/client';

export default function AdminSecurityPage() {
  const [factor, setFactor] = useState<{ id: string; status: string } | null>(null);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const brandedQrUri = (value: string) => {
    if (!value.startsWith('otpauth://')) return value;
    try {
      const url = new URL(value);
      const account = decodeURIComponent(url.pathname.slice(1)).split(':').pop() || 'Admin';
      url.pathname = `/ZEPNEX:${account}`;
      url.searchParams.set('issuer', 'ZEPNEX');
      return url.toString();
    } catch {
      return value;
    }
  };

  const load = async () => {
    const { data, error } = await createClient().auth.mfa.listFactors();
    if (error) { setMessage(error.message); return; }
    setFactor(data?.totp?.find((item) => item.status === 'verified') || null);
    const totpFactors = data?.totp as Array<{ id: string; status: string }> | undefined;
    setPendingFactorId(totpFactors?.find((item) => item.status === 'unverified')?.id || null);
  };
  useEffect(() => { load(); }, []);

  const enroll = async () => {
    setBusy(true);
    const client = createClient();
    setMessage('');
    if (pendingFactorId) {
      const { error } = await client.auth.mfa.unenroll({ factorId: pendingFactorId });
      if (error) { setMessage(error.message); setBusy(false); return; }
      setPendingFactorId(null);
    }
    const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'ZEPNEX Admin Authenticator' });
    if (error) setMessage(error.message);
    else { setQr(brandedQrUri(data?.totp.qr_code || '')); setSecret(data?.totp.secret || ''); setPendingFactorId(data?.id || null); setMessage('Scan the ZEPNEX QR code, then enter the six-digit code to verify.'); }
    setBusy(false);
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('Verifying OTP...');
    const client = createClient();
    const { data: factors } = await client.auth.mfa.listFactors();
    const pending = (factors?.totp as Array<{ id: string; status: string }> | undefined)?.find((item) => item.status === 'unverified');
    if (!pending) { setMessage('No pending authenticator enrollment found. Please start setup again.'); setBusy(false); return; }
    const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId: pending.id });
    if (challengeError) { setMessage(challengeError.message); setBusy(false); return; }
    const { error } = await client.auth.mfa.verify({ factorId: pending.id, challengeId: challenge.id, code });
    setMessage(error ? `Verification failed: ${error.message}` : 'Authenticator enabled successfully.');
    if (!error) { setQr(''); setSecret(''); setCode(''); setPendingFactorId(null); await load(); }
    setBusy(false);
  };

  const removeFactor = async () => {
    if (!factor) return;
    const { error } = await createClient().auth.mfa.unenroll({ factorId: factor.id });
    setMessage(error ? error.message : 'Authenticator removed.');
    if (!error) { setFactor(null); await load(); }
  };

  const qrImage = qr.startsWith('data:') ? qr : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qr)}`;

  return <div className="space-y-6 max-w-3xl"><PageHeader title="Security & MFA" subtitle="Protect administrator access with an authenticator app." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Security & MFA' }]} />
    <div className="bg-card border border-border rounded-md p-6 space-y-5"><div><p className="font-semibold">Authenticator app</p><p className="text-sm text-muted-foreground mt-1">{factor ? 'A verified authenticator is protecting this account.' : 'Admin accounts must verify a TOTP authenticator before entering the panel.'}</p></div>
      {!qr && <div className="flex flex-wrap gap-3"><button onClick={enroll} className="px-4 py-2 bg-primary text-white rounded-sm text-sm font-semibold">{factor ? 'Add another authenticator' : 'Set up authenticator'}</button>{factor && <button onClick={removeFactor} className="px-4 py-2 border border-red-300 text-red-700 rounded-sm text-sm font-semibold">Remove authenticator</button>}</div>}
      {qr && <form onSubmit={verify} className="space-y-3"><img src={qrImage} alt="ZEPNEX authenticator QR code" className="w-56 h-56 border border-border bg-white p-2" /><p className="text-xs text-muted-foreground break-all">Manual setup key: {secret}</p><label htmlFor="setup-mfa-code" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Enter OTP from your registered mobile number</label><p className="text-xs text-muted-foreground">Use the current code from your registered authenticator app.</p><input id="setup-mfa-code" name="mfaCode" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" className="border border-border rounded-sm px-3 py-2 tracking-[0.35em]" /><button type="submit" disabled={busy || code.length !== 6} className="ml-2 px-4 py-2 bg-primary text-white rounded-sm text-sm font-semibold disabled:opacity-50">{busy ? 'Verifying...' : 'Verify'}</button><button type="button" onClick={() => { setQr(''); setSecret(''); setCode(''); }} className="ml-2 px-4 py-2 border border-border rounded-sm text-sm">Cancel</button></form>}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div></div>;
}
