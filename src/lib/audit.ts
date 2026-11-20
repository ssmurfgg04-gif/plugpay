// Audit logging helper. Writes to `audit_log` when present; swallows errors so
// a missing table never breaks the request (migration 0009 creates it).
import { hasSupabase, supabase } from '@/lib/supabase';

export async function logAudit(action: string, actorId: string | null, details: Record<string, unknown> = {}): Promise<void> {
  if (!hasSupabase) return;
  try {
    await supabase().from('audit_log').insert({
      who: actorId, what: action, occurred_at: new Date().toISOString(),
      details: JSON.stringify(details),
    });
  } catch {
    // table may not exist (migration not yet applied) — ignore
  }
}
