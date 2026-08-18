-- OCC Hacks 2026 — drop the Iota Xi membership question from the volunteer form.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The question only ever shaped the hacker roster, so `registrations.iota_xi`
-- stays. On the volunteer side it was `not null`, which means the column has to
-- go in the same change that stops the form posting it — otherwise every new
-- sign-up fails the not-null check.
alter table public.volunteers
  drop column if exists iota_xi;
