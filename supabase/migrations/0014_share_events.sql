-- 0014_share_events.sql
create table if not exists share_events (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid,
  channel text,
  created_at timestamptz default now()
);
create index if not exists share_events_merchant_idx on share_events(merchant_id);
