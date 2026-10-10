// Supabase server client. Server-only: never import this from a client
// component. Credentials resolve in this order:
//   1. Real environment variables (Netlify UI / .env.local) — always win.
//   2. src/lib/env.gen.ts — baked at build time by scripts/gen-env.mjs from
//      netlify.toml [build.environment] so deployed functions reach the DB
//      even though those variables do not exist at function runtime.
// With neither, hasSupabase is false and server components fall back to the
// bundled seed data (builds never break).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { GEN_SUPABASE_URL, GEN_SUPABASE_SERVICE_KEY } from '@/lib/env.gen';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || GEN_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || GEN_SUPABASE_SERVICE_KEY;

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
