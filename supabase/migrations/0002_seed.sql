-- add missing aggregate columns
alter table merchants add column if not exists vouches_received int default 0;

-- PlugPay seed: realistic Nairobi CBD trader data
-- Images live in /public/images (generated assets, repo-committed)

-- ============ PLATFORM STATS ============
insert into platform_stats (id, verified_merchants, buildings_mapped, avg_rating, gmv_month_kes)
values (1, 687, 12, 4.8, 12460000)
on conflict (id) do nothing;

-- ============ BUILDINGS ============
insert into buildings (slug, name, address, area, lat, lng, total_stalls, registered_merchants, avg_rating, coverage_pct, image_url, verified) values
('anniversary-towers', 'Anniversary Towers', 'Mama Ngina Street', 'Nairobi CBD', -1.2841, 36.8265, 72, 58, 4.7, 81, '/images/bldg-anniversary.jpg', true),
('kencom-house', 'Kencom House', 'Moi Avenue', 'Nairobi CBD', -1.2864, 36.8258, 84, 71, 4.8, 85, '/images/bldg-kencom.jpg', true),
('bazaar-plaza', 'Bazaar Plaza', 'Moi Avenue / Biashara Street', 'Nairobi CBD', -1.2852, 36.8251, 96, 63, 4.6, 66, '/images/bldg-bazaar.jpg', true),
('bihi-towers', 'Bihi Towers', 'Moi Avenue', 'Nairobi CBD', -1.2849, 36.8247, 64, 39, 4.5, 61, '/images/bldg-bihi.jpg', true),
('jamia-mall', 'Jamia Mall', 'Kimathi Street', 'Nairobi CBD', -1.2837, 36.8238, 88, 52, 4.7, 59, '/images/bldg-jamia.jpg', true),
('rehema-house', 'Rehema House', 'Kimathi Street', 'Nairobi CBD', -1.2833, 36.8233, 56, 31, 4.6, 55, '/images/bldg-rehema.jpg', true)
on conflict (slug) do nothing;

-- ============ STALLS (Anniversary Towers floor 3 + Kencom floors, illustrative grids) ============
insert into stalls (building_id, floor, code, status, merchant_slug)
select b.id, f.floor, f.code, f.status, f.slug
from buildings b
join (values
  ('anniversary-towers','Ground','G-01','unregistered',null),
  ('anniversary-towers','Ground','G-02','unregistered',null),
  ('anniversary-towers','Floor 1','1-03','basic',null),
  ('anniversary-towers','Floor 1','1-04','unregistered',null),
  ('anniversary-towers','Floor 1','1-05','basic',null),
  ('anniversary-towers','Floor 1','1-06','unregistered',null),
  ('anniversary-towers','Floor 1','1-07','unregistered',null),
  ('anniversary-towers','Floor 1','1-08','unregistered',null),
  ('anniversary-towers','Floor 2','2-01','verified',null),
  ('anniversary-towers','Floor 2','2-02','unregistered',null),
  ('anniversary-towers','Floor 2','2-03','unregistered',null),
  ('anniversary-towers','Floor 2','2-04','unregistered',null),
  ('anniversary-towers','Floor 2','2-05','basic',null),
  ('anniversary-towers','Floor 2','2-06','unregistered',null),
  ('anniversary-towers','Floor 2','2-11','basic',null),
  ('anniversary-towers','Floor 3','3-09','basic',null),
  ('anniversary-towers','Floor 3','3-12','unregistered',null),
  ('anniversary-towers','Floor 3','3-14','trusted','zawadi-fashion-house'),
  ('anniversary-towers','Floor 4','4-08','unregistered',null),
  ('anniversary-towers','Floor 4','4-09','unregistered',null),
  ('kencom-house','Floor 1','K1-05','trusted','grace-beauty-bar'),
  ('kencom-house','Floor 2','K2-05','verified',null),
  ('kencom-house','Floor 3','K3-12','trusted','wanjiku-electronics'),
  ('kencom-house','Floor 3','K3-13','unregistered',null),
  ('kencom-house','Floor 4','K4-08','unregistered',null)
) as f(bname, floor, code, status, slug)
on b.slug = f.bname
where not exists (select 1 from stalls s where s.building_id = b.id and s.floor = f.floor and s.code = f.code);

-- ============ MERCHANTS ============
insert into merchants (slug, business_name, owner_name, category, description, building_id, building_name, stall_label, phone, whatsapp, avatar_url, verified, verified_date, trust_score, rating_avg, rating_count, sales_count, followers_count, mpesa_paybill, mpesa_account, established_year, opening_hours, instagram, tiktok, facebook, claimed) values
('wanjiku-electronics', 'Wanjiku Electronics', 'Jane Wanjiku', 'Electronics',
 'We specialize in selling and repairing electronics, computers, and mobile phones. All products come with a 30-day warranty. Delivery available across Kenya on M-Pesa payment.',
 (select id from buildings where slug='kencom-house'), 'Kencom House', 'Floor 3, Stall 12',
 '+254 712 345 678', '+254 712 345 678', '/images/av-wanjiku.jpg', 'trusted', '2025-11-14', 92, 4.8, 156, 105, 235, '174379', null, 2016, 'Mon - Sat, 8:00am - 6:30pm', '@wanjiku.electronics', '@wanjikuelectronics', '/WanjikuElectronics', true),
('zawadi-fashion-house', 'Zawadi Fashion House', 'Jane Mwangi', 'Fashion & Clothing',
 'We stock Ankara fashion, leather bags and handcrafted accessories. Everything is sourced directly from local artisans. M-Pesa accepted. Delivery available across Nairobi.',
 (select id from buildings where slug='anniversary-towers'), 'Anniversary Towers', 'Floor 3, Stall 14',
 '+254 720 118 442', '+254 720 118 442', '/images/av-mwangi.jpg', 'trusted', '2025-09-02', 88, 4.9, 203, 312, 418, '528001', 'ZAWADI', 2019, 'Mon - Sat, 8:30am - 6:00pm', '@zawadi.house', '@zawadifashion', '/ZawadiFashionHouse', true),
('grace-beauty-bar', 'Grace Beauty Bar', 'Grace Akinyi', 'Beauty & Cosmetics',
 'Original cosmetics, skincare and hair products. We test everything before it reaches the shelf. Wholesale prices for salons in town.',
 (select id from buildings where slug='kencom-house'), 'Kencom House', 'Floor 1, Stall 5',
 '+254 733 260 915', '+254 733 260 915', '/images/av-akinyi.jpg', 'trusted', '2026-01-20', 84, 4.7, 98, 141, 176, '802234', null, 2021, 'Mon - Sat, 9:00am - 6:00pm', '@gracebeautybar', '@gracebeauty254', '/GraceBeautyBar', true),
('kamau-tech-solutions', 'Kamau Tech Solutions', 'Peter Kamau', 'Electronics',
 'Phone repairs, screen replacements and refurbished laptops with a 60-day guarantee. Walk-in or send us a message on WhatsApp and we diagnose remotely.',
 (select id from buildings where slug='bazaar-plaza'), 'Bazaar Plaza', 'Floor 2, Stall 21',
 '+254 726 914 530', '+254 726 914 530', '/images/av-kamau.jpg', 'verified', '2026-03-11', 76, 4.6, 74, 89, 120, '610447', null, 2018, 'Mon - Sat, 8:00am - 7:00pm', '@kamau.tech', null, null, true),
('mama-nduta-sukuma', 'Mama Nduta Fresh Produce', 'Nduta Wambui', 'Food & Groceries',
 'Fresh sukuma, tomatoes, onions and fruits delivered from Limuru every morning. Chagua mwenyewe, we pack for you. Free delivery within CBD for orders above KSh 500.',
 (select id from buildings where slug='rehema-house'), 'Rehema House', 'Ground, Stall G-4',
 '+254 714 882 093', '+254 714 882 093', '/images/av-nduta.jpg', 'verified', '2026-02-05', 71, 4.8, 132, 268, 301, null, null, 2020, 'Mon - Sat, 6:30am - 5:00pm', '@mamanduta.ke', null, null, true),
('otieno-phone-clinic', 'Otieno Phone Clinic', 'Brian Otieno', 'Electronics',
 'Flashing, software fixes and genuine spare parts for all phone models. If we cannot fix it, you do not pay. Data recovery available.',
 (select id from buildings where slug='bihi-towers'), 'Bihi Towers', 'Floor 1, Stall 9',
 '+254 799 341 276', '+254 799 341 276', '/images/av-otieno.jpg', 'basic', null, 58, 4.4, 41, 63, 55, null, null, 2022, 'Mon - Sat, 8:30am - 6:30pm', '@otienoclinic', null, null, false),
('amina-shoes-boutique', 'Amina Shoes Boutique', 'Amina Kibe', 'Shoes & Bags',
 'Imported ladies shoes and matching bags. Sizes 36 to 42. We restock every two weeks from Dubai, so what you see on the status is what we have.',
 (select id from buildings where slug='anniversary-towers'), 'Anniversary Towers', 'Floor 2, Stall 8',
 '+254 738 507 621', '+254 738 507 621', '/images/av-kibe.jpg', 'verified', '2026-04-18', 69, 4.5, 67, 78, 143, '903118', null, 2023, 'Mon - Sat, 9:00am - 6:00pm', '@amina.shoes', '@aminaboutique', null, true),
('mutua-hardware-centre', 'Mutua Hardware Centre', 'David Mutua', 'Hardware & Tools',
 'Power tools, plumbing, electricals and construction materials. Trade prices for fundis and contractors. Ask for the price list on WhatsApp.',
 (select id from buildings where slug='jamia-mall'), 'Jamia Mall', 'Floor 2, Stall 5',
 '+254 745 623 190', '+254 745 623 190', '/images/av-mutua.jpg', 'basic', null, 52, 4.3, 38, 47, 40, null, null, 2017, 'Mon - Sat, 8:00am - 5:30pm', null, null, null, false),
('chebet-stationery-hub', 'Chebet Stationery Hub', 'Faith Chebet', 'Stationery',
 'School and office stationery, photocopying, lamination and printing. Bulk discounts for schools. TSC-approved supplier.',
 (select id from buildings where slug='rehema-house'), 'Rehema House', 'Floor 1, Stall 2',
 '+254 721 470 358', '+254 721 470 358', '/images/av-chebet.jpg', 'basic', null, 55, 4.6, 52, 91, 66, null, null, 2021, 'Mon - Fri, 8:00am - 5:00pm', null, null, null, false),
('kariuki-watch-repairs', 'Kariuki Watch & Repairs', 'Samuel Kariuki', 'Accessories & Jewellery',
 'Watch repair, battery replacement, strap fitting and engraving. We also stock original watches from Seiko and Casio. Same-day service.',
 (select id from buildings where slug='kencom-house'), 'Kencom House', 'Floor 4, Stall 8',
 '+254 732 605 487', '+254 732 605 487', '/images/av-kariuki.jpg', 'verified', '2026-05-30', 61, 4.7, 45, 58, 72, null, null, 2015, 'Mon - Sat, 9:00am - 5:30pm', '@kariuki.watch', null, null, true)
on conflict (slug) do nothing;

-- update building aggregates
update buildings b set registered_merchants = coalesce(m.ct, 0)
from (select building_id, count(*) ct from merchants group by building_id) m
where m.building_id = b.id;

-- ============ PRODUCTS ============
insert into products (merchant_id, name, price_kes, image_url, stock, category)
select m.id, p.name, p.price_kes, p.img, p.stock, p.cat from merchants m
join (values
  ('wanjiku-electronics','Samsung Galaxy A15', 18500, '/images/pr-phone1.jpg', 4, 'Phones'),
  ('wanjiku-electronics','Tecno Camon 20', 22000, '/images/pr-phone2.jpg', 3, 'Phones'),
  ('wanjiku-electronics','HP 250 G8 Laptop', 42000, '/images/pr-laptop1.jpg', 2, 'Laptops'),
  ('wanjiku-electronics','Dell Inspiron 15', 55000, '/images/pr-laptop2.jpg', 1, 'Laptops'),
  ('wanjiku-electronics','USB-C Charger 65W', 1200, '/images/pr-charger.jpg', 20, 'Accessories'),
  ('wanjiku-electronics','Wireless Earbuds', 2800, '/images/pr-earbuds.jpg', 12, 'Accessories'),
  ('zawadi-fashion-house','Ankara Wrap Dress', 1800, '/images/pr-dress.jpg', 8, 'Dresses'),
  ('zawadi-fashion-house','Leather Handbag', 3500, '/images/pr-handbag.jpg', 5, 'Bags'),
  ('zawadi-fashion-house','Beaded Necklace Set', 900, '/images/pr-necklace.jpg', 15, 'Jewellery'),
  ('grace-beauty-bar','Shea Body Butter 500g', 850, '/images/pr-shea.jpg', 18, 'Skincare'),
  ('grace-beauty-bar','Matte Lipstick', 650, '/images/pr-lipstick.jpg', 24, 'Makeup'),
  ('kamau-tech-solutions','Refurbished ThinkPad T480', 26500, '/images/pr-thinkpad.jpg', 3, 'Laptops'),
  ('kamau-tech-solutions','Phone Screen Replacement', 2500, '/images/pr-screen.jpg', 30, 'Repairs'),
  ('amina-shoes-boutique','Ladies Sneakers', 2900, '/images/pr-sneakers.jpg', 9, 'Shoes'),
  ('amina-shoes-boutique','Evening Clutch Bag', 1500, '/images/pr-clutch.jpg', 11, 'Bags'),
  ('mutua-hardware-centre','Bosch Cordless Drill', 7800, '/images/pr-drill.jpg', 6, 'Power Tools'),
  ('mutua-hardware-centre','Tool Box Set 108pc', 4300, '/images/pr-toolbox.jpg', 7, 'Hand Tools'),
  ('mama-nduta-sukuma','Sukuma Wiki Bunch', 20, '/images/pr-sukuma.jpg', 100, 'Vegetables'),
  ('mama-nduta-sukuma','Tomatoes per Kg', 90, '/images/pr-tomatoes.jpg', 60, 'Vegetables')
) as p(mslug, name, price_kes, img, stock, cat)
on m.slug = p.mslug
where not exists (select 1 from products pr where pr.merchant_id = m.id and pr.name = p.name);

-- ============ RECEIPTS (recent verified sales history) ============
insert into receipts (merchant_id, receipt_no, buyer_name, buyer_phone, items, total_kes, mpesa_code, delivery, status, created_at)
select m.id, r.no, r.buyer, r.phone, r.items::jsonb, r.total, r.code, r.delivery, 'settled', now() - (r.days || ' days')::interval
from merchants m
join (values
  ('wanjiku-electronics','#00849','Kevin Njoroge','0712 *** 441','[{"name":"Samsung Galaxy A15","qty":1,"price":18500}]',18500,'TGH5K9P2Q','pickup',2),
  ('wanjiku-electronics','#00848','Mercy Wanjiru','0721 *** 008','[{"name":"Wireless Earbuds","qty":1,"price":2800}]',2800,'QDF23K1LM','runner',4),
  ('wanjiku-electronics','#00847','Alice Wafula','0733 *** 552','[{"name":"USB-C Charger 65W","qty":2,"price":1200}]',2400,'RST8N4VWX','pickup',6),
  ('zawadi-fashion-house','#01201','Christine Achieng','0710 *** 237','[{"name":"Ankara Wrap Dress","qty":1,"price":1800}]',1800,'TYU5R7B22','runner',1),
  ('zawadi-fashion-house','#01187','Naomi Kilonzo','0729 *** 774','[{"name":"Leather Handbag","qty":1,"price":3500}]',3500,'PLM9Q3ZTD','pickup',3),
  ('zawadi-fashion-house','#01156','Dennis Mutiso','0716 *** 940','[{"name":"Beaded Necklace Set","qty":2,"price":900}]',1800,'JKL2W6HNC','pickup',9),
  ('grace-beauty-bar','#00912','Winnie Owuor','0724 *** 315','[{"name":"Shea Body Butter 500g","qty":2,"price":850}]',1700,'MNO7C2PQ5','pickup',2),
  ('grace-beauty-bar','#00911','Caroline Mumbi','0745 *** 862','[{"name":"Matte Lipstick","qty":3,"price":650}]',1950,'BCD4T9XZA','runner',5),
  ('mama-nduta-sukuma','#00455','Esther Kilonzo','0718 *** 129','[{"name":"Tomatoes per Kg","qty":3,"price":90},{"name":"Sukuma Wiki Bunch","qty":4,"price":20}]',350,'GHI8V1SDF','runner',1),
  ('amina-shoes-boutique','#00378','Lydia Chelangat','0728 *** 603','[{"name":"Ladies Sneakers","qty":1,"price":2900}]',2900,'UVW6K4MNB','pickup',4),
  ('kamau-tech-solutions','#00291','John Maina','0732 *** 517','[{"name":"Phone Screen Replacement","qty":1,"price":2500}]',2500,'OPQ3E8RTU','pickup',7),
  ('kariuki-watch-repairs','#00144','Rose Njeri','0714 *** 926','[{"name":"Watch Battery Replacement","qty":1,"price":450}]',450,'ZAB9M2LKP','pickup',10)
) as r(mslug, no, buyer, phone, items, total, code, delivery, days)
on m.slug = r.mslug
where not exists (select 1 from receipts rc where rc.receipt_no = r.no);

-- ============ REVIEWS ============
insert into reviews (merchant_id, receipt_no, author_name, author_initials, rating, body, verified, created_at)
select m.id, rv.receipt_no, rv.author, rv.initials, rv.rating, rv.body, true, now() - (rv.days || ' days')::interval
from merchants m
join (values
  ('wanjiku-electronics','#01201','James Kamau','JK',5,'Bought a Samsung Galaxy. Genuine product, great price. Comes with the 30-day warranty as promised. Fast delivery too.',2),
  ('wanjiku-electronics','#01187','Faith Otieno','FO',5,'Best electronics shop in Moi Avenue. Honest seller, original products. Will definitely come back.',8),
  ('wanjiku-electronics','#01156','Brian Njoroge','BN',4,'Good laptop at a fair price. Would have preferred the original box but overall happy with the purchase.',15),
  ('wanjiku-electronics','#00849','Sharon Anyango','SA',5,'The seller confirmed my receipt in seconds and even helped me set up the phone. Verified seller badge earned.',1),
  ('zawadi-fashion-house','#01201','Christine Achieng','CA',5,'The Ankara dress fits perfectly and the quality is better than the photos. Receipt came straight to my WhatsApp.',1),
  ('zawadi-fashion-house','#01187','Naomi Kilonzo','NK',5,'Ordered a handbag for my sister in Kisumu, delivery was next morning. Jane is so patient with sizes and colours.',4),
  ('zawadi-fashion-house','#01156','Dennis Mutiso','DM',4,'Nice beaded sets. Packaging could be better but the items themselves are lovely and authentic.',9),
  ('grace-beauty-bar','#00912','Winnie Owuor','WO',5,'Original shea butter, my skin loves it. She even threw in a free sample of the new lotion.',2),
  ('grace-beauty-bar','#00911','Caroline Mumbi','CM',4,'Lipsticks are long-lasting. One shade was slightly different from the status photo but still pretty.',5),
  ('mama-nduta-sukuma','#00455','Esther Kilonzo','EK',5,'Vegetables arrived fresh and clean, packed nicely. The receipt makes it easy to track my weekly budget.',1),
  ('amina-shoes-boutique','#00378','Lydia Chelangat','LC',5,'Sneakers are exactly as shown, genuine and comfortable. Sizing guidance was spot on.',4),
  ('kamau-tech-solutions','#00291','John Maina','JM',5,'Fixed my screen in one hour and the price was fair. Got a proper receipt too which is rare for repairs.',7),
  ('kariuki-watch-repairs','#00144','Rose Njeri','RN',4,'Quick battery replacement and he polished the watch for free. Will bring the other one next week.',10)
) as rv(mslug, receipt_no, author, initials, rating, body, days)
on m.slug = rv.mslug
where not exists (select 1 from reviews r2 where r2.merchant_id = m.id and r2.author_name = rv.author);

-- recompute merchant rating aggregates from reviews
update merchants m set
  rating_avg = coalesce(round(sub.avg_r, 1), 0),
  rating_count = coalesce(sub.ct, 0)
from (select merchant_id, avg(rating) avg_r, count(*) ct from reviews group by merchant_id) sub
where sub.merchant_id = m.id;

-- ============ VOUCHES (neighbour trust graph) ============
insert into vouches (from_merchant, to_merchant)
select a.id, b.id from merchants a, merchants b
where (a.slug, b.slug) in (
  ('zawadi-fashion-house','wanjiku-electronics'),
  ('grace-beauty-bar','wanjiku-electronics'),
  ('kamau-tech-solutions','wanjiku-electronics'),
  ('wanjiku-electronics','zawadi-fashion-house'),
  ('amina-shoes-boutique','zawadi-fashion-house'),
  ('grace-beauty-bar','zawadi-fashion-house'),
  ('kamau-tech-solutions','otieno-phone-clinic'),
  ('mutua-hardware-centre','kamau-tech-solutions'),
  ('wanjiku-electronics','grace-beauty-bar'),
  ('zawadi-fashion-house','grace-beauty-bar'),
  ('chebet-stationery-hub','mama-nduta-sukuma'),
  ('mama-nduta-sukuma','chebet-stationery-hub')
)
on conflict do nothing;

-- recompute vouch counts
update merchants m set vouches_received = coalesce(sub.ct, 0)
from (select to_merchant, count(*) ct from vouches group by to_merchant) sub
where sub.to_merchant = m.id;

-- ============ TESTIMONIALS ============
insert into testimonials (name, initials, role, quote, rating, sort)
select t.name, t.initials, t.role, t.quote, t.rating, t.sort from (values
  ('Wanjiru M.','WM','Fashion seller, Nairobi CBD','Buyers used to disappear the moment I asked for payment first. Now they see my badge and pay before I have even finished typing the price.',5,1),
  ('Kevin O.','KO','Phone buyer, Kilimani','Someone sent me a fake M-Pesa message last December. With PlugPay I just check the receipt code and I know the sale is real.',5,2),
  ('Mama Grace N.','GN','Groceries, Rehema House','My regulars send the receipt link to their friends. I have never advertised, but new customers find me every week.',5,3)
) as t(name, initials, role, quote, rating, sort)
where not exists (select 1 from testimonials x where x.name = t.name);

-- ============ FAQS ============
insert into faqs (group_name, question, answer, sort)
select f.grp, f.q, f.a, f.sort from (values
  ('The basics','What is PlugPay, in one line?','PlugPay is trust infrastructure for Nairobi''s informal traders. It turns years of reputation that used to live only in people''s memory into something visible, provable and portable. Every verified trader gets a public profile anchored to a real ID, real sales and real peer vouches. That proof travels with them even if the stall, the building or the block changes.','The basics',1),
  ('The basics','What''s actually behind a trader''s trust score?','The platform is built in layers: verified identity, a peer vouching graph, a transaction ledger, public discovery and payments, each one feeding the layer above it. A trust score is not a single input. It is the compounding output of ID verification, landlord confirmation, peer vouches and receipt-anchored reviews. The more of that history a trader has, the harder their profile is to fake.','The basics',2),
  ('The basics','Who is PlugPay actually built for?','Three groups who currently deal blind. Traders who cannot prove years of honest dealing to a stranger. Buyers who cannot tell a legitimate seller from one who will not be there next month. And landlords whose buildings cannot be marketed on reputation. PlugPay gives each the same underlying proof, just surfaced differently: a profile, a search result, a verified-building badge.','The basics',3),
  ('How it works','What can I actually do on PlugPay?','Get verified once, then record every sale, and an itemised receipt fires automatically to the buyer on WhatsApp. Fellow traders and your landlord can vouch for you, and buyers can only review a sale that has a real receipt behind it. Your whole track record lives at one shareable link, and delivery runs through a marketplace of verified runners.','How it works',1),
  ('How it works','How does an agent onboard a building?','An agent signs in with an SMS or email OTP, then sets up an individual landlord account for the building. The landlord can log back into that account later to add more stall owners and complete monthly verification. The agent onboards the building and its stalls, and adds each stall owner''s details, especially the phone number and email attached to their stall. Each stall owner then gets a claim link and signs up with a WhatsApp OTP, with SMS as a fallback.','How it works',2),
  ('How it works','How do I know a receipt is real?','Every PlugPay receipt carries a unique confirmation code tied to the sale recorded in the trader''s ledger. Tap the link or search the code on this site and you will see the exact sale it came from, the trader it belongs to and whether their ID has been verified. Fake M-Pesa screenshots have nowhere to hide when the receipt can be checked in seconds.','How it works',3),
  ('Pricing & money','If it''s free for traders, how does PlugPay make money?','Not by charging traders. Verification and unlimited receipts stay free, because the platform gets more valuable the more traders it holds. Revenue comes from the errand and delivery marketplace connecting buyers to verified runners, and from turning trading history into credit data that suppliers and lenders can act on. Traders get verified for free; PlugPay earns once that trust becomes something spendable.','Pricing & money',1),
  ('Pricing & money','Does PlugPay hold my money?','No. Payments go directly between you and your buyer on M-Pesa, exactly like today. PlugPay records the sale, anchors the receipt and updates your trust profile. We never touch the cash, so there is no float, no delays and nothing extra to lose.','Pricing & money',2)
) as f(grp, q, a, gname, sort)
where not exists (select 1 from faqs x where x.question = f.q);
