// Supabase server client. Falls back to null when env vars are absent
// (site then reads bundled seed data so builds never break).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabase = Boolean(url && serviceKey);

let cached: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error('Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return cached;
}
