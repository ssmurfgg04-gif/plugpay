-- 0009_audit_log.sql
-- Audit trail for state-changing actions (who, what, when, details).
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  who text,
  what text not null,
  occurred_at timestamptz default now(),
  details text,
  created_at timestamptz default now()
);
create index if not exists audit_log_who_idx on audit_log(who);
create index if not exists audit_log_what_idx on audit_log(what);
create index if not exists audit_log_occurred_idx on audit_log(occurred_at);
