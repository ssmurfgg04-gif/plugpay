-- 0017_otp_codes.sql
-- Email OTP + PIN auth for landlord (and reusable) portals.
create table if not exists otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'landlord',
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  used boolean not null default false,
  created_at timestamptz default now()
);
create index if not exists otp_codes_email_idx on otp_codes(email);
