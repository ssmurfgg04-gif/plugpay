-- PlugPay schema: trust layer for Kenya's WhatsApp commerce
create extension if not exists pg_trgm;

-- ============ BUILDINGS ============
create table if not exists buildings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  address text not null,
  area text not null default 'Nairobi CBD',
  lat numeric,
  lng numeric,
  total_stalls int not null default 0,
  registered_merchants int not null default 0,
  avg_rating numeric(3,1) default 0,
  coverage_pct int default 0,
  image_url text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- ============ STALLS ============
create table if not exists stalls (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings(id) on delete cascade,
  floor text not null,
  code text not null,
  status text not null default 'unregistered' check (status in ('trusted','verified','basic','unregistered')),
  merchant_slug text,
  created_at timestamptz default now()
);

-- ============ MERCHANTS ============
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  business_name text not null,
  owner_name text not null,
  category text not null,
  description text,
  building_id uuid references buildings(id),
  building_name text,
  stall_label text,
  phone text,
  whatsapp text,
  avatar_url text,
  verified text not null default 'basic' check (verified in ('trusted','verified','basic')),
  verified_date date,
  trust_score int default 0,
  rating_avg numeric(3,1) default 0,
  rating_count int default 0,
  sales_count int default 0,
  followers_count int default 0,
  mpesa_paybill text,
  mpesa_account text,
  established_year int,
  opening_hours text,
  instagram text,
  tiktok text,
  facebook text,
  claimed boolean default false,
  pin_hash text,
  is_demo boolean default false,
  created_at timestamptz default now()
);

create index if not exists merchants_name_trgm on merchants using gin (business_name gin_trgm_ops);
create index if not exists merchants_category_idx on merchants(category);

-- ============ PRODUCTS ============
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  name text not null,
  price_kes int not null,
  image_url text,
  stock int default 0,
  category text,
  created_at timestamptz default now()
);

-- ============ RECEIPTS (sales) ============
create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  receipt_no text unique not null,
  buyer_name text,
  buyer_phone text,
  items jsonb not null default '[]',
  total_kes int not null,
  mpesa_code text,
  delivery text default 'pickup' check (delivery in ('pickup','runner')),
  status text not null default 'settled' check (status in ('pending','settled','cancelled')),
  created_at timestamptz default now()
);

-- ============ REVIEWS ============
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  receipt_no text,
  author_name text not null,
  author_initials text,
  rating int not null check (rating between 1 and 5),
  body text not null,
  verified boolean default false,
  created_at timestamptz default now()
);

-- ============ VOUCHES ============
create table if not exists vouches (
  id uuid primary key default gen_random_uuid(),
  from_merchant uuid references merchants(id) on delete cascade,
  to_merchant uuid references merchants(id) on delete cascade,
  created_at timestamptz default now(),
  unique(from_merchant, to_merchant),
  check (from_merchant <> to_merchant)
);

-- ============ TESTIMONIALS ============
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null,
  role text not null,
  quote text not null,
  rating int default 5,
  sort int default 0
);

-- ============ FAQS ============
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  question text not null,
  answer text not null,
  sort int default 0
);

-- ============ DEMO OTP CODES ============
create table if not exists otp_codes (
  phone text primary key,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- ============ PLATFORM STATS (single row) ============
create table if not exists platform_stats (
  id int primary key default 1,
  verified_merchants int default 0,
  buildings_mapped int default 0,
  avg_rating numeric(3,1) default 0,
  gmv_month_kes bigint default 0,
  updated_at timestamptz default now()
);

-- ============ RLS: public read, service-only write ============
alter table buildings enable row level security;
alter table stalls enable row level security;
alter table merchants enable row level security;
alter table products enable row level security;
alter table receipts enable row level security;
alter table reviews enable row level security;
alter table vouches enable row level security;
alter table testimonials enable row level security;
alter table faqs enable row level security;
alter table platform_stats enable row level security;
alter table otp_codes enable row level security;

do $$
declare t text;
begin
  foreach t in array array['buildings','stalls','merchants','products','receipts','reviews','vouches','testimonials','faqs','platform_stats']
  loop
    execute format('create policy %I on %I for select using (true)', t || '_public_read', t);
  end loop;
end $$;

-- otp_codes: no public read policy at all (service role only)
