-- 0008_admin_role.sql
-- Allow the 'admin' role in app_users now that the Admin console exists
-- (migration 0007 shipped the constraint without it).
-- Safe to re-run (idempotent ALTERs).

alter table app_users drop constraint if exists app_users_role_check;
alter table app_users add constraint app_users_role_check check (role in ('trader', 'landlord', 'agent', 'admin'));

-- Backfill safety net: if any rows exist with a role outside the check
-- and the add above succeeds they would fail, so run after, not before.
