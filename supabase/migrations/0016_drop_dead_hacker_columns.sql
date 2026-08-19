-- OCC Hacks 2026 — drop the hacker questions that are no longer asked.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- These five are the last of migration 0001's original question set. Migration
-- 0003 replaced it — `track` became the three rank columns, `diet` was folded
-- into `needs` — and dropped their NOT NULLs so the columns could sit empty
-- rather than block new sign-ups. Nothing has written them since and nothing
-- reads them, so every roster export carries five always-null columns.
--
-- `school` was in the same batch and is the exception: it came back as a
-- question in migration 0005, alongside `major`. It stays.
--
-- Any answers collected under the old form go with these. Save them first if
-- you want them:
--
--   select user_id, email, track, team, experience, diet, notes
--     from public.hackers
--    where coalesce(track, team, experience, diet, notes) is not null;
alter table public.hackers
  drop column if exists track,
  drop column if exists team,
  drop column if exists experience,
  drop column if exists diet,
  drop column if exists notes;
