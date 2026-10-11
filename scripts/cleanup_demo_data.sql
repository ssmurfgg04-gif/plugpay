-- Demo data wipe for PlugPay (executed via Supabase management API).
-- Removes ALL fabricated seed content so the platform starts on real data
-- only: real buildings, real FAQ copy, honest stats, empty directory.
-- The seed migrations (0002, 0006) remain in the repo to re-seed a staging
-- copy if ever needed.

-- Children of merchants first (FK-safe order)
DELETE FROM reviews;
DELETE FROM vouches;
DELETE FROM receipts;
DELETE FROM invoices;
DELETE FROM products;
DELETE FROM riders;
DELETE FROM claims;
DELETE FROM stall_history;

-- Fabricated directory merchants (every row is seed or test data)
DELETE FROM merchants;

-- Test/seed portal accounts
DELETE FROM app_users;

-- Seed landlord shells (no real owners attached)
DELETE FROM landlord_accounts;

-- Fabricated social proof on the landing page
DELETE FROM testimonials;

-- Honest platform stats: zeros, buildings_mapped reflects the real table
UPDATE platform_stats
SET verified_merchants = 0,
    buildings_mapped = (SELECT COUNT(*) FROM buildings),
    avg_rating = 0,
    gmv_month_kes = 0,
    updated_at = now();

SELECT
  (SELECT COUNT(*) FROM merchants) AS merchants,
  (SELECT COUNT(*) FROM app_users) AS app_users,
  (SELECT COUNT(*) FROM products) AS products,
  (SELECT COUNT(*) FROM receipts) AS receipts,
  (SELECT COUNT(*) FROM reviews) AS reviews,
  (SELECT COUNT(*) FROM vouches) AS vouches,
  (SELECT COUNT(*) FROM testimonials) AS testimonials,
  (SELECT COUNT(*) FROM buildings) AS buildings,
  (SELECT COUNT(*) FROM faqs) AS faqs,
  (SELECT verified_merchants FROM platform_stats LIMIT 1) AS stat_merchants,
  (SELECT buildings_mapped FROM platform_stats LIMIT 1) AS stat_buildings,
  (SELECT gmv_month_kes FROM platform_stats LIMIT 1) AS stat_gmv;
