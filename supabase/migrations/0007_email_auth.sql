-- 0007_email_auth.sql
-- Email + password authentication for PlugPay portals (seller / landlord / agent).
-- Replaces the demo OTP flow (otp_codes table + one-time codes surfaced on screen).
-- Passwords are hashed server-side with scrypt (per-user random salt) and never
-- stored or logged in plaintext. Safe to re-run.

-- 1) Portal users. One row per email; role decides which portal the user owns.
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('trader', 'landlord', 'agent')),
  merchant_slug text,
  landlord_id uuid,
  created_at timestamptz default now(),
  last_login_at timestamptz
);

create index if not exists app_users_email_lower_idx on app_users (lower(email));
create index if not exists app_users_merchant_slug_idx on app_users (merchant_slug);

-- 2) Merchants can carry the owner email for contact/lookup.
alter table merchants add column if not exists email text;
create index if not exists merchants_email_idx on merchants (email);

-- 3) Landlord accounts gain an owner email + link to the auth user.
alter table landlord_accounts add column if not exists owner_email text;
create index if not exists landlord_accounts_owner_email_idx on landlord_accounts (owner_email);

-- 4) The OTP flow is retired: drop its storage.
drop table if exists otp_codes;

-- 5) Lock down: no anonymous client talks to the DB directly. The Next.js API
--    layer is the only client (service role, server-side only).
alter table app_users enable row level security;
drop policy if exists "no anon access" on app_users;
