-- OCC Hacks 2026 — record the eligibility and code-of-conduct agreement.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- All three forms have always required the box before they would submit, but
-- nothing kept the answer. The only trace was `dob`, which covers the age half
-- and says nothing about the code of conduct — so agreement could be inferred
-- from "this row exists" and never shown.
--
-- Same shape as `email_opt_in` in migration 0006: every completed row is a yes,
-- and the column is there to record it rather than to gate anything. The exact
-- sentence differs by form — the hacker box also affirms current enrolment,
-- which volunteers and mentors are not asked for — so this is "agreed to the
-- box on their form", not one shared statement.
alter table public.hackers
  add column if not exists eligibility_agreed boolean not null default false;

alter table public.volunteers
  add column if not exists eligibility_agreed boolean not null default false;

alter table public.mentors
  add column if not exists eligibility_agreed boolean not null default false;

-- Backfill: a finished sign-up can't have got past the submit without ticking
-- it. Drafts stay false — a half-filled row genuinely hasn't agreed yet, and
-- the box lives on the last step, which the reader hasn't reached.
update public.hackers
  set eligibility_agreed = true
  where completed_at is not null;

update public.volunteers
  set eligibility_agreed = true
  where completed_at is not null;

update public.mentors
  set eligibility_agreed = true
  where completed_at is not null;
