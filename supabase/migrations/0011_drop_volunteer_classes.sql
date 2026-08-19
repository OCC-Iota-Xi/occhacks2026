-- OCC Hacks 2026 — drop the extra-credit classes question from the mentor form.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The question only ever appeared on the mentor form — volunteers were never
-- asked — and it's gone from there now, so nothing writes the column. The
-- hacker side keeps its own `registrations.classes`, which is still asked and
-- still the roster's extra-credit list.
--
-- Unlike `volunteers.iota_xi` in migration 0007, this column has a default and
-- so wasn't blocking new sign-ups; it's dropped because it's dead, not because
-- it had to go. Any answers already collected go with it — save them first if
-- you want them:
--
--   select user_id, email, full_name, classes
--     from public.volunteers
--    where cardinality(classes) > 0;
alter table public.volunteers
  drop column if exists classes;
