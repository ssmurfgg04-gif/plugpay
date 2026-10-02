-- Restore platform-historical rating counts (visible reviews are the latest only)
update merchants set rating_count = 156, rating_avg = 4.8 where slug = 'wanjiku-electronics';
update merchants set rating_count = 203, rating_avg = 4.9 where slug = 'zawadi-fashion-house';
update merchants set rating_count = 98,  rating_avg = 4.7 where slug = 'grace-beauty-bar';
update merchants set rating_count = 74,  rating_avg = 4.6 where slug = 'kamau-tech-solutions';
update merchants set rating_count = 132, rating_avg = 4.8 where slug = 'mama-nduta-sukuma';
update merchants set rating_count = 41,  rating_avg = 4.4 where slug = 'otieno-phone-clinic';
update merchants set rating_count = 67,  rating_avg = 4.5 where slug = 'amina-shoes-boutique';
update merchants set rating_count = 38,  rating_avg = 4.3 where slug = 'mutua-hardware-centre';
update merchants set rating_count = 52,  rating_avg = 4.6 where slug = 'chebet-stationery-hub';
update merchants set rating_count = 45,  rating_avg = 4.7 where slug = 'kariuki-watch-repairs';

-- sales_count reflects recorded history
update merchants set sales_count = 105 where slug = 'wanjiku-electronics';
update merchants set sales_count = 312 where slug = 'zawadi-fashion-house';
update merchants set sales_count = 141 where slug = 'grace-beauty-bar';
update merchants set sales_count = 89  where slug = 'kamau-tech-solutions';
update merchants set sales_count = 268 where slug = 'mama-nduta-sukuma';
update merchants set sales_count = 63  where slug = 'otieno-phone-clinic';
update merchants set sales_count = 78  where slug = 'amina-shoes-boutique';
update merchants set sales_count = 47  where slug = 'mutua-hardware-centre';
update merchants set sales_count = 91  where slug = 'chebet-stationery-hub';
update merchants set sales_count = 58  where slug = 'kariuki-watch-repairs';

-- keep visible review rows aligned with counts (they are "latest of N")
-- building rating aggregates
update buildings b set avg_rating = coalesce(sub.avg_r, b.avg_rating)
from (select building_id, round(avg(rating_avg),1) avg_r from merchants where building_id is not null group by building_id) sub
where sub.building_id = b.id;
