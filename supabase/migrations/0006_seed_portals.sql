-- 0006_seed_portals.sql: seed the portal demo data (buildings, sellers, claims,
-- landlord accounts, receipts, invoices, catalogue, riders) to match the UI.

-- allow 'vacant' stalls for the landlord portal
alter table stalls drop constraint if exists stalls_status_check;
alter table stalls add constraint stalls_status_check
  check (status in ('trusted','verified','basic','unregistered','vacant'));

-- ============ BUILDINGS ============
insert into buildings (slug, name, address, area, floors, total_stalls, registered_merchants, coverage_pct, source, verified)
values
  ('anniversary-towers', 'Anniversary Towers', 'Moi Avenue', 'Nairobi CBD', 6, 72, 58, 67, 'directory', true),
  ('lonrho-house', 'Lonrho House', 'Kenyatta Avenue', 'Nairobi CBD', 4, 58, 39, 67, 'directory', true),
  ('kencom-house', 'Kencom House', 'Moi Avenue', 'Nairobi CBD', 5, 84, 51, 61, 'directory', true),
  ('odeon-cinema-bldg', 'Odeon Cinema Bldg', 'Tom Mboya Street', 'Nairobi CBD', 3, 64, 28, 44, 'directory', true)
on conflict (slug) do update set
  floors = excluded.floors,
  total_stalls = excluded.total_stalls,
  address = excluded.address,
  source = excluded.source;

-- ============ DIRECTORY SELLERS ============
insert into merchants (slug, business_name, owner_name, category, building_id, building_name, stall_label, phone, whatsapp, verified, trust_score, sales_count, rating_count, rating_avg, claimed, is_demo)
values
  ('jane-mwangi', 'Jane Mwangi', 'Jane Mwangi', 'Fashion', (select id from buildings where slug='anniversary-towers'), 'Anniversary Towers', 'Floor 3, Stall 301', '0796 100 201', '0796 100 201', 'verified', 94, 847, 38, 4.9, true, true),
  ('peter-otieno', 'Peter Otieno', 'Peter Otieno', 'Electronics', (select id from buildings where slug='anniversary-towers'), 'Anniversary Towers', 'Floor 3, Stall 302', '0796 100 202', '0796 100 202', 'verified', 88, 312, 24, 4.8, true, true),
  ('david-mutua', 'David Mutua', 'David Mutua', 'Hardware', (select id from buildings where slug='anniversary-towers'), 'Anniversary Towers', 'Floor 2, Stall 202', '0796 100 203', '0796 100 203', 'verified', 86, 560, 41, 4.7, true, true),
  ('amina-kibe', 'Amina Kibe', 'Amina Kibe', 'Food', (select id from buildings where slug='anniversary-towers'), 'Anniversary Towers', 'Floor 3, Stall 303', '0796 100 204', '0796 100 204', 'verified', 82, 210, 17, 4.6, true, true),
  ('grace-akinyi', 'Grace Akinyi', 'Grace Akinyi', 'Beauty', (select id from buildings where slug='lonrho-house'), 'Lonrho House', 'Floor 1, Stall 5', '0796 100 205', '0796 100 205', 'verified', 93, 428, 33, 4.9, true, true)
on conflict (slug) do update set
  building_id = excluded.building_id,
  building_name = excluded.building_name,
  stall_label = excluded.stall_label,
  verified = excluded.verified,
  sales_count = excluded.sales_count,
  rating_avg = excluded.rating_avg,
  rating_count = excluded.rating_count,
  trust_score = excluded.trust_score;

-- ============ DEFAULT SELLER: Wanjiku Electronics ============
update merchants set
  role = 'Electronics Retailer',
  bio = 'Specializing in phones, laptops & repairs. In business since 2016.',
  about = 'We specialize in selling and repairing electronics, computers, and mobile phones. All products come with a 30-day warranty. Delivery available across Kenya via M-Pesa payment.',
  street = 'Moi Avenue, Nairobi CBD',
  building_id = (select id from buildings where slug='anniversary-towers'),
  building_name = 'Anniversary Towers',
  stall_label = 'Floor 3, Stall 305',
  whatsapp = '+254 712 345 678',
  instagram = '@wanjiku.electronics',
  tiktok = '@wanjikuelectronics',
  facebook = '/WanjikuElectronics',
  mpesa_paybill = '2332323',
  mpesa_account = '20262026',
  established_year = 2016,
  ll_phone_verified = true,
  claimed = true
where slug = 'wanjiku-electronics';

-- ============ LANDLORD ACCOUNTS ============
insert into landlord_accounts (client_id, name, street, total_stalls, owner_phone)
values
  ('lb1', 'Anniversary Towers', 'Moi Avenue · Nairobi CBD', 72, '0733000111'),
  ('lb2', 'Lonrho House', 'Kenyatta Ave · Nairobi CBD', 58, '0733000222')
on conflict (client_id) do update set
  street = excluded.street,
  total_stalls = excluded.total_stalls;

-- ============ STALLS: verified occupants + vacant pools ============
insert into stalls (building_id, floor, code, status, merchant_slug) values
  ((select id from buildings where slug='anniversary-towers'), '3', '301', 'verified', 'jane-mwangi'),
  ((select id from buildings where slug='anniversary-towers'), '3', '302', 'verified', 'peter-otieno'),
  ((select id from buildings where slug='anniversary-towers'), '2', '202', 'verified', 'david-mutua'),
  ((select id from buildings where slug='anniversary-towers'), '3', '303', 'verified', 'amina-kibe'),
  ((select id from buildings where slug='anniversary-towers'), '3', '305', 'verified', 'wanjiku-electronics'),
  ((select id from buildings where slug='lonrho-house'), '1', '5', 'verified', 'grace-akinyi'),
  ((select id from buildings where slug='anniversary-towers'), '1', '103', 'vacant', null),
  ((select id from buildings where slug='anniversary-towers'), '2', '204', 'vacant', null),
  ((select id from buildings where slug='anniversary-towers'), '4', '402', 'vacant', null),
  ((select id from buildings where slug='lonrho-house'), '2', '4', 'vacant', null),
  ((select id from buildings where slug='lonrho-house'), '3', '9', 'vacant', null);

-- ============ CLAIMS: traders waiting for landlord verification ============
insert into claims (client_id, token, business_name, owner_name, phone, category, floor, number, loc, building_name, status, verified, source, draft, sent_at)
values
  ('mary',   'clm-mary',   'Mary Njeri',   'Mary Njeri',   '0796 200 301', 'Textiles',          '1', '8',  'Floor 1, Stall 8',  'Anniversary Towers', 'CLAIMED', false, 'agent', false, now() - interval '2 days'),
  ('samuel', 'clm-samuel', 'Samuel Kiptoo', 'Samuel Kiptoo', '0796 200 302', 'Phone Accessories', '2', '14', 'Floor 2, Stall 14', 'Anniversary Towers', 'CLAIMED', false, 'agent', false, now() - interval '1 day'),
  ('lucy',   'clm-lucy',   'Lucy Wambui',  'Lucy Wambui',  '0796 200 303', 'Cosmetics',         '3', '3',  'Floor 3, Stall 3',  'Anniversary Towers', 'CLAIMED', false, 'agent', false, now() - interval '5 hours')
on conflict (client_id) do nothing;

-- ============ RECEIPTS for Wanjiku Electronics ============
insert into receipts (merchant_id, receipt_no, buyer_name, buyer_phone, items, total_kes, mpesa_code, sent_at, stock_applied, doc_status, demo, status, created_at) values
  ((select id from merchants where slug='wanjiku-electronics'), 'RCP-001', 'Grace Wanjiku', '0712 345 601',
   '[{"name":"Samsung Galaxy A15","qty":1,"unit":18500,"price":18500,"productId":"","category":""}]'::jsonb,
   18500, 'TKA3F8M2QD', now() - interval '1 day' - interval '1 hour', true, 'COMPLETE', true, 'settled', now() - interval '1 day' - interval '2 hours'),
  ((select id from merchants where slug='wanjiku-electronics'), 'RCP-002', 'Brian Otieno', '0722 118 402',
   '[{"name":"Wireless Earbuds","qty":2,"unit":2800,"price":5600,"productId":"","category":""},{"name":"USB-C Charger 65W","qty":3,"unit":1200,"price":3600,"productId":"","category":""}]'::jsonb,
   9200, 'TKA3F9L7ZX', now() - interval '2 days' - interval '1 hour', true, 'COMPLETE', true, 'settled', now() - interval '2 days' - interval '2 hours'),
  ((select id from merchants where slug='wanjiku-electronics'), 'RCP-003', 'Faith Njeri', '0733 904 117',
   '[{"name":"Wireless Earbuds","qty":2,"unit":2800,"price":5600,"productId":"","category":""},{"name":"USB-C Charger 65W","qty":2,"unit":1200,"price":2400,"productId":"","category":""},{"name":"Phone screen replacement","qty":1,"unit":6300,"price":6300,"productId":"","category":""}]'::jsonb,
   14300, 'TKB1N4C6RW', now() - interval '3 days' - interval '1 hour', true, 'COMPLETE', true, 'settled', now() - interval '3 days' - interval '2 hours'),
  ((select id from merchants where slug='wanjiku-electronics'), 'RCP-004', 'Samuel Kiptoo', '0745 660 230',
   '[{"name":"Wireless Earbuds","qty":2,"unit":2800,"price":5600,"productId":"","category":""},{"name":"Phone case","qty":2,"unit":1000,"price":2000,"productId":"","category":""}]'::jsonb,
   7600, 'TKB2P7D9HS', null, false, 'PENDING', true, 'settled', now() - interval '4 days' - interval '2 hours'),
  ((select id from merchants where slug='wanjiku-electronics'), 'RCP-005', 'Mercy Akinyi', '0701 552 889',
   '[{"name":"USB-C Charger 65W","qty":5,"unit":1200,"price":6000,"productId":"","category":""},{"name":"Laptop bag","qty":1,"unit":3500,"price":3500,"productId":"","category":""},{"name":"Wireless mouse","qty":1,"unit":2600,"price":2600,"productId":"","category":""}]'::jsonb,
   12100, 'TKB3Q5E1JV', null, false, 'PENDING', true, 'settled', now() - interval '5 days' - interval '2 hours');

-- ============ INVOICES for Wanjiku Electronics ============
insert into invoices (merchant_id, token, number, buyer_name, buyer_phone, source, items, total, status, doc_status, demo, created_at) values
  ((select id from merchants where slug='wanjiku-electronics'), 'INV-001', 'INV-001', 'Daniel Mwangi', '0711 207 944', 'WhatsApp',
   '[{"name":"Tecno Camon 20","qty":1,"unit":22000,"price":22000,"productId":"","category":""},{"name":"USB-C Charger 65W","qty":1,"unit":1200,"price":1200,"productId":"","category":""},{"name":"Phone case","qty":1,"unit":1300,"price":1300,"productId":"","category":""}]'::jsonb,
   24500, 'PENDING', 'COMPLETE', true, now() - interval '2 days' - interval '3 hours'),
  ((select id from merchants where slug='wanjiku-electronics'), 'INV-002', 'INV-002', 'Esther Chebet', '0723 481 075', 'WhatsApp',
   '[{"name":"Wireless Earbuds","qty":2,"unit":2800,"price":5600,"productId":"","category":""},{"name":"USB-C Charger 65W","qty":1,"unit":1200,"price":1200,"productId":"","category":""},{"name":"Power bank 10,000mAh","qty":1,"unit":5000,"price":5000,"productId":"","category":""}]'::jsonb,
   11800, 'PENDING', 'COMPLETE', true, now() - interval '3 days' - interval '3 hours'),
  ((select id from merchants where slug='wanjiku-electronics'), 'INV-003', 'INV-003', 'Kevin Omondi', '0734 612 380', 'WhatsApp',
   '[{"name":"SSD 256GB","qty":1,"unit":6500,"price":6500,"productId":"","category":""},{"name":"RAM 8GB DDR4","qty":1,"unit":5200,"price":5200,"productId":"","category":""},{"name":"Windows install & setup","qty":1,"unit":3500,"price":3500,"productId":"","category":""},{"name":"Laptop bag","qty":1,"unit":3500,"price":3500,"productId":"","category":""}]'::jsonb,
   18700, 'PENDING', 'PENDING', true, now() - interval '1 day' - interval '3 hours'),
  ((select id from merchants where slug='wanjiku-electronics'), 'INV-004', 'INV-004', 'Lucy Wambui', '0768 190 523', 'WhatsApp',
   '[{"name":"Wireless Earbuds","qty":2,"unit":2800,"price":5600,"productId":"","category":""},{"name":"Screen guard","qty":4,"unit":1000,"price":4000,"productId":"","category":""}]'::jsonb,
   9600, 'PENDING', 'PENDING', true, now() - interval '9 hours');

-- ============ CATALOGUE for Wanjiku Electronics ============
insert into products (merchant_id, name, price_kes, stock, category) values
  ((select id from merchants where slug='wanjiku-electronics'), 'Samsung Galaxy A15', 18500, 4, 'Phones'),
  ((select id from merchants where slug='wanjiku-electronics'), 'HP 250 G8 Laptop', 42000, 2, 'Laptops'),
  ((select id from merchants where slug='wanjiku-electronics'), 'USB-C Charger 65W', 1200, 20, 'Accessories'),
  ((select id from merchants where slug='wanjiku-electronics'), 'Tecno Camon 20', 22000, 3, 'Phones'),
  ((select id from merchants where slug='wanjiku-electronics'), 'Dell Inspiron 3511', 55000, 1, 'Laptops'),
  ((select id from merchants where slug='wanjiku-electronics'), 'Wireless Earbuds', 2800, 12, 'Accessories');

-- ============ RIDERS for Wanjiku Electronics ============
insert into riders (merchant_slug, name, role) values
  ('wanjiku-electronics', 'Boda Brian', 'Boda rider'),
  ('wanjiku-electronics', 'Asha Deliveries', 'Runner');
