'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './config';
import type { Database } from '@/types/database';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(url, anonKey);
  }
  return browserClient;
}
