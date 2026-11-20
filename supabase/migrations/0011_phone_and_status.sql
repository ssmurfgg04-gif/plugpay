-- 0011_phone_and_status.sql
-- Phone on portal accounts (checklist S1/L1/A1) + agent approval status.
alter table app_users add column if not exists phone text;
alter table app_users add column if not exists status text default 'active';
create index if not exists app_users_phone_idx on app_users(phone);

-- Admin console flags on merchants (AD1).
alter table merchants add column if not exists suspended boolean default false;
alter table merchants add column if not exists badge_override text;
alter table merchants add column if not exists trust_override integer;
