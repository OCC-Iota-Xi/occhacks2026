-- OCC Hacks 2026 — welcome-email bookkeeping.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Both sign-up forms upsert, so they also fire when someone edits their answers.
-- This column marks the row as already welcomed: the server action claims it
-- (null → now()) before sending, so an edit never triggers a second email and
-- two concurrent submits can't both win the claim.
alter table public.registrations
  add column if not exists welcome_email_sent_at timestamptz;

alter table public.volunteers
  add column if not exists welcome_email_sent_at timestamptz;

-- Backfill: anyone who signed up before welcome emails existed should not get
-- one retroactively the next time they edit their form. Drop this statement if
-- you would rather send to the existing roster.
update public.registrations
  set welcome_email_sent_at = created_at
  where welcome_email_sent_at is null;

update public.volunteers
  set welcome_email_sent_at = created_at
  where welcome_email_sent_at is null;
