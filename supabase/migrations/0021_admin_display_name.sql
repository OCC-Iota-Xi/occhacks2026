-- OCC Hacks 2026 — rename an organizer.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- `display_name` is what the dashboard shows wherever an organizer is named:
-- the reviewer picker, the assignment menu, the activity log, the byline on a
-- note. Migration 0018 seeded it with `on conflict do nothing`, so re-running
-- that file will not change a name that is already there — this update will.
update public.admin_users
   set display_name = 'flower man'
 where email = 'swathanasaynee@student.cccd.edu';
