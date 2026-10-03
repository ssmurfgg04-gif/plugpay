// Supabase server client. Server-only: never import this from a client
// component. Falls back to the project credentials bundled from netlify.toml
// so the deployed Netlify functions always reach the database, even though
// netlify.toml [build.environment] vars do not reach function runtime.
// Real env vars always take precedence when present.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Same credentials already shipped in netlify.toml inside this repo.
const FALLBACK_URL = 'https://xycmzhpkuzyhmgucwqys.supabase.co';
const FALLBACK_SERVICE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Y216aHBrdXp5aG1ndWN3cXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDk0OTU0NywiZXhwIjoyMTA2NTI1NTQ3fQ.dPq4rgrBw4q0rSW_yiOhDihbszwEfvtFEjF-kejYpWE';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE;

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
