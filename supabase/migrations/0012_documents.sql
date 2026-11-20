-- 0012_documents.sql
-- Private documents (ID, selfie, licence, KRA) with admin-only signed URLs.
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid,
  type text,
  status text default 'pending',
  storage_path text,
  reviewed_by text,
  created_at timestamptz default now()
);
create index if not exists documents_seller_idx on documents(seller_id);
