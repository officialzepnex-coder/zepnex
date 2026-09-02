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

  const load = async () => {
    const { data, error } = await createClient().auth.mfa.listFactors();
    if (error) { setMessage(error.message); return; }
    setFactor(data?.totp?.find((item) => item.status === 'verified') || null);
    const totpFactors = data?.totp as Array<{ id: string; status: string }> | undefined;
    setPendingFactorId(totpFactors?.find((item) => item.status === 'unverified')?.id || null);
  };
  useEffect(() => { load(); }, []);

  const enroll = async () => {
    const client = createClient();
    setMessage('');
    if (pendingFactorId) {
      const { error } = await client.auth.mfa.unenroll({ factorId: pendingFactorId });
      if (error) { setMessage(error.message); return; }
      setPendingFactorId(null);
    }
    const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'ZEPNEX Admin Authenticator' });
    if (error) setMessage(error.message);
    else { setQr(data?.totp.qr_code || ''); setSecret(data?.totp.secret || ''); setPendingFactorId(data?.id || null); setMessage('Scan the QR code, then enter the six-digit code to verify.'); }
  };

  const verify = async () => {
    const client = createClient();
    const { data: factors } = await client.auth.mfa.listFactors();
    const pending = (factors?.totp as Array<{ id: string; status: string }> | undefined)?.find((item) => item.status === 'unverified');
    if (!pending) return;
    const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId: pending.id });
    if (challengeError) { setMessage(challengeError.message); return; }
    const { error } = await client.auth.mfa.verify({ factorId: pending.id, challengeId: challenge.id, code });
    setMessage(error ? error.message : 'Authenticator enabled.');
    if (!error) { setQr(''); setSecret(''); setPendingFactorId(null); await load(); }
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
      {qr && <div className="space-y-3"><img src={qrImage} alt="Authenticator QR code" className="w-56 h-56 border border-border bg-white p-2" /><p className="text-xs text-muted-foreground break-all">Manual setup key: {secret}</p><input inputMode="numeric" pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" className="border border-border rounded-sm px-3 py-2" /><button onClick={verify} className="ml-2 px-4 py-2 bg-primary text-white rounded-sm text-sm font-semibold">Verify</button><button onClick={() => { setQr(''); setSecret(''); }} className="ml-2 px-4 py-2 border border-border rounded-sm text-sm">Cancel</button></div>}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div></div>;
}
