-- Fuller stall grids so floor maps look like real buildings
with floors as (
  select unnest(array['Ground','Floor 1','Floor 2','Floor 3','Floor 4']) as floor
),
nums as (
  select generate_series(1, 18) as n
),
prefixes as (
  select floor, case when floor = 'Ground' then 'G' else replace(floor, 'Floor ', '') end as p
  from floors
),
gen as (
  select b.id as building_id, p.floor, (p.p || '-' || lpad(n.n::text, 2, '0')) as code
  from buildings b
  cross join prefixes p
  cross join nums n
  where b.slug in ('anniversary-towers','kencom-house','bazaar-plaza')
)
insert into stalls (building_id, floor, code, status, merchant_slug)
select g.building_id, g.floor, g.code, 'unregistered', null
from gen g
where not exists (
  select 1 from stalls s
  where s.building_id = g.building_id and s.floor = g.floor and s.code = g.code
);

update stalls set status = 'basic'
where status = 'unregistered'
  and code in ('K3-05','K3-06','K3-11','3-03','3-08','3-15','2-03','2-07','G-04','1-09');

update stalls set status = 'verified'
where status = 'unregistered'
  and code in ('K3-02','3-05','3-11','2-12','1-14','G-09');

update stalls set status = 'trusted'
where status = 'unregistered'
  and code in ('K3-09','3-02','2-05');
