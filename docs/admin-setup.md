# PlugPay administrator access

Administrator accounts cannot self-register.

1. Apply `supabase/migrations/0008_mvp_admin_and_building_details.sql` in the Supabase SQL Editor.
2. Register the intended administrator using the existing email/password flow as an agent account, or choose an existing authorised account.
3. In the Supabase SQL Editor, promote only that exact account:

```sql
update public.app_users
set role = 'admin'
where lower(email) = lower('ADMIN_EMAIL_HERE');
```

4. Confirm the query affected exactly one expected row, then sign in at `/admin` with that account's existing email and password.

Do not expose the Supabase service-role key, do not allow admin role selection in public registration, and do not deploy admin access before the migration has been applied.
