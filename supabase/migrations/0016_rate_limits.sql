-- 0016_rate_limits.sql
create table if not exists rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count integer not null default 0
);
