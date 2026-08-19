-- OCC Hacks 2026 — `registrations` becomes `hacker`.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Naming the table after who signs up rather than after the act of signing up,
-- so it reads alongside `volunteers` and `mentors` — the three sign-ups, one
-- table each.
--
-- `if exists` because this was applied by hand in the dashboard before it was
-- written down; on a database that already has the new name it's a no-op rather
-- than an error.
alter table if exists public.registrations
  rename to hacker;

-- Nothing else has to move. RLS policies, the foreign key to auth.users, and
-- the row data all follow the table through a rename.
--
-- What does NOT follow is the names Postgres gave the constraints and indexes
-- when the table was still `registrations` — `registrations_pkey` and
-- `registrations_ranks_distinct` keep those names, and earlier migrations still
-- refer to them by name. Renaming them would break replaying this history from
-- scratch, so they stay as they are; the mismatch is cosmetic.
