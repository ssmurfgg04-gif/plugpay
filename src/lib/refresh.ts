// Long-lived app-session refresh — user from app_users, no row needed for re-issue? We do want a row.
import { hasSupabase, supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppUserRow } from '@/lib/types';

export async function refreshAppUser(userId: string): Promise<AppUserRow | null> {
  if (!hasSupabase) return null;
  const db = supabase();
  const { data, error } = await db.from('app_users').select('id, email, role, merchant_slug, landlord_id').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return data;
}
