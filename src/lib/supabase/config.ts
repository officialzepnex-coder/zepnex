const PLACEHOLDER_VALUES = new Set([
  '',
  'dummy.supabase.co',
  'dummykey.updateyourkkey.here',
  'your-supabase-url',
  'your-supabase-anon-key',
]);

function isPlaceholder(value: string | undefined) {
  return !value || PLACEHOLDER_VALUES.has(value.trim().toLowerCase()) || value.toLowerCase().includes('your-');
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (isPlaceholder(url) || isPlaceholder(anonKey)) return false;

  try {
    return new URL(url).protocol === 'https:' && new URL(url).hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
  }
  return { url, anonKey };
}
