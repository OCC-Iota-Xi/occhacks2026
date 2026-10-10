-- OCC Hacks 2026 — three more organizers.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The database half of the allowlist in lib/admin/access.ts. The constant gets
-- these addresses past the proxy and the layout; this insert is what lets
-- `public.is_admin()` return true for them, and without it the dashboard loads
-- and every query comes back empty.
--
-- `do update` rather than 0018's `do nothing`, so re-running this file sets
-- the names even if the rows are already there.
insert into public.admin_users (email, display_name) values
  ('lhoang104@student.cccd.edu', 'joe'),
  ('cperez214@student.cccd.edu', 'mr worldwide'),
  ('ldang81@student.cccd.edu', 'gamergirl')
on conflict (email) do update
  set display_name = excluded.display_name;
