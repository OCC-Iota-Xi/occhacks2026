-- OCC Hacks 2026 — drop the mentor form's first-choice time question.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The question asked which single block a mentor would prefer, one step before
-- the form asks which blocks they're free for at all. The second question is
-- the one shifts are built from, so the first was a softer duplicate of it —
-- and answering both made the form feel longer than it is.
--
-- Nullable with no default, so nothing depended on it and no write breaks.
-- Existing answers go with the column; they're a subset of `availability`,
-- which stays:
--
--   select user_id, email, preferred_time, availability
--     from public.mentors
--    where preferred_time is not null;
alter table public.mentors
  drop column if exists preferred_time;
