-- 0005_portals.sql: backend tables for the seller / agent / landlord portals UI
-- Maps the client UI store entities onto real database tables.

-- ============ MERCHANTS: seller profile extras ============
alter table merchants add column if not exists role text;
alter table merchants add column if not exists bio text;
alter table merchants add column if not exists about text;
alter table merchants add column if not exists street text;
alter table merchants add column if not exists ll_phone_verified boolean default false;

-- ============ RECEIPTS: align with the sales docs UI ============
alter table receipts add column if not exists sent_at timestamptz;
alter table receipts add column if not exists stock_applied boolean default false;
alter table receipts add column if not exists doc_status text default 'COMPLETE';
alter table receipts add column if not exists review jsonb;
alter table receipts add column if not exists demo boolean default false;

-- ============ INVOICES (pay links) ============
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  token text unique not null,
  number text,
  buyer_name text,
  buyer_phone text,
  source text default 'WhatsApp',
  items jsonb not null default '[]',
  total int not null default 0,
  status text not null default 'PENDING' check (status in ('PENDING','PAID')),
  doc_status text default 'PENDING',
  payment_ref text,
  demo boolean default false,
  created_at timestamptz default now()
);

-- ============ AGENT CLAIMS (stall invitations) ============
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  token text unique not null,
  business_name text,
  owner_name text,
  phone text,
  category text,
  floor text,
  number text,
  loc text,
  building_name text,
  status text not null default 'INVITED' check (status in ('INVITED','CLAIMED')),
  verified boolean default false,
  source text default 'agent' check (source in ('agent','landlord')),
  draft boolean default false,
  created_by text,
  sent_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz default now()
);

-- ============ LANDLORD ACCOUNTS (one per building) ============
create table if not exists landlord_accounts (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  name text unique not null,
  street text default 'Nairobi CBD',
  total_stalls int default 0,
  owner_phone text,
  pin_hash text,
  created_at timestamptz default now()
);

-- ============ VACATED TRADERS (landlord portal history) ============
create table if not exists vacated_traders (
  id uuid primary key default gen_random_uuid(),
  building_name text not null,
  name text,
  phone text,
  sub text,
  initials text,
  color text,
  vacated_at timestamptz default now()
);

-- ============ RIDERS (trusted delivery people) ============
create table if not exists riders (
  id uuid primary key default gen_random_uuid(),
  merchant_slug text not null,
  name text not null,
  role text default 'Boda rider',
  created_at timestamptz default now()
);

-- ============ STALL HISTORY (seller moves) ============
create table if not exists stall_history (
  id uuid primary key default gen_random_uuid(),
  merchant_slug text not null,
  building text not null,
  loc text not null,
  moved_at timestamptz default now()
);

-- ============ BUILDINGS: floors + provenance ============
alter table buildings add column if not exists floors int;
alter table buildings add column if not exists source text default 'directory';

create index if not exists invoices_merchant_idx on invoices(merchant_id);
create index if not exists claims_phone_idx on claims(phone);
create index if not exists claims_building_idx on claims(building_name);
create index if not exists riders_slug_idx on riders(merchant_slug);

-- RLS: public read for the new doc tables, service-role writes only
alter table invoices enable row level security;
alter table claims enable row level security;
alter table landlord_accounts enable row level security;
alter table vacated_traders enable row level security;
alter table riders enable row level security;
alter table stall_history enable row level security;

do $$
declare t text;
begin
  foreach t in array array['invoices','claims','vacated_traders','riders','stall_history']
  loop
    execute format('create policy %I on %I for select using (true)', t || '_public_read', t);
  end loop;
  -- landlord_accounts readable only by service role (holds pin hashes)
end $$;
