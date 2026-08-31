'use client';

import React from 'react';
import { inputClass } from './AdminShell';
import { createClient } from '@/lib/supabase/client';

export default function ImageField({
  label,
  value,
  onChange,
  folder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  hint?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('brand-assets').upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('brand-assets').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. You can still paste an image URL.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex gap-3 items-start">
        <div className="w-20 h-20 rounded-sm border border-border bg-secondary overflow-hidden flex-shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-[10px] text-muted-foreground">No image</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            className={inputClass}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
          />
          <label className="inline-flex items-center gap-2 text-xs text-primary cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {busy ? 'Uploading…' : 'Upload file'}
          </label>
          {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
