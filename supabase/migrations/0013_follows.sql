-- 0013_follows.sql
create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_slug text,
  target_slug text,
  created_at timestamptz default now(),
  unique (follower_slug, target_slug)
);
create index if not exists follows_target_idx on follows(target_slug);
