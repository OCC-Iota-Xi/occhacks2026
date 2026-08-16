-- OCC Hacks 2026 — school + major on the hacker registration.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- `school` already exists (migration 0001) but was made nullable in 0003 when
-- the question was dropped. It's asked again now, alongside a new `major`.
alter table public.registrations
  add column if not exists major text;
