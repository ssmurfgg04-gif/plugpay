-- 0015_engagement_counters.sql
alter table merchants add column if not exists engagement_count integer default 0;
