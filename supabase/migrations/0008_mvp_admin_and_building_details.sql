-- 0008_mvp_admin_and_building_details.sql
-- Apply once in Supabase SQL editor before deploying the admin/building update.
-- Admin cannot self-register; an existing authorised account must be promoted manually.

alter table public.app_users
  drop constraint if exists app_users_role_check;

alter table public.app_users
  add constraint app_users_role_check
  check (role in ('trader', 'landlord', 'agent', 'admin'));

alter table public.buildings
  add column if not exists maps_url text,
  add column if not exists category text,
  add column if not exists landlord_name text,
  add column if not exists landlord_phone text,
  add column if not exists landlord_email text,
  add column if not exists created_by uuid references public.app_users(id) on delete set null;

create index if not exists buildings_created_by_idx on public.buildings(created_by);
