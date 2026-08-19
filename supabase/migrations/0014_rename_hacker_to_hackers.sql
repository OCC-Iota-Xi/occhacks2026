-- OCC Hacks 2026 — `hacker` becomes `hackers`.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Migration 0013 landed on the singular. The other two sign-up tables are
-- `volunteers` and `mentors`, so this is the odd one out — a table holds many
-- rows and reads better named for them. Same reason as before, spelled right.
alter table if exists public.hacker
  rename to hackers;

-- As in 0013: the row data, RLS policies and the foreign key to auth.users all
-- follow the table, while `hackers_pkey` and `registrations_ranks_distinct`
-- keep the names Postgres gave them under the original table.
