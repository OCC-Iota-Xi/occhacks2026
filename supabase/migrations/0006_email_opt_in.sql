-- OCC Hacks 2026 — consent to event update email.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Both forms require this box, so the flag records that the reader agreed to
-- event updates rather than gating anything — every stored row is a yes.
alter table public.registrations
  add column if not exists email_opt_in boolean not null default false;

alter table public.volunteers
  add column if not exists email_opt_in boolean not null default false;
