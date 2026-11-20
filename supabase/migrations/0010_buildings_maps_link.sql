-- 0010_buildings_maps_link.sql
-- Store a Google Maps link per building (agent onboarding Step 1).
alter table buildings add column if not exists maps_link text;
