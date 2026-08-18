-- OCC Hacks 2026 — volunteer and mentor become separate sign-ups.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The two roles now have their own page and their own form, and one person can
-- hold both. That makes `user_id` alone too narrow for the primary key: the row
-- is identified by who signed up *and* which way they're helping. 'both' stops
-- being a role — someone who wants both fills in both forms.

-- The check has to go first, so the 'both' rows can be rewritten below.
alter table public.volunteers
  drop constraint if exists volunteers_role_check;

-- And the key, so a user can briefly hold two rows mid-migration.
alter table public.volunteers
  drop constraint if exists volunteers_pkey;

-- Anyone signed up as 'both' gets a second, mentor-side row carrying the same
-- answers. `welcome_email_sent_at` is copied across so the split can't mail
-- them a second welcome, and `created_at` is kept — they signed up when they
-- signed up, not when this migration ran.
insert into public.volunteers (
  user_id, email, full_name, occ_id, dob, phone, role, availability, expertise,
  shirt, needs, classes, email_opt_in, welcome_email_sent_at, completed_at,
  created_at, updated_at
)
select
  user_id, email, full_name, occ_id, dob, phone, 'mentor', availability, expertise,
  shirt, needs, classes, email_opt_in, welcome_email_sent_at, completed_at,
  created_at, now()
from public.volunteers
where role = 'both';

-- The original row keeps the volunteer half of that answer.
update public.volunteers
  set role = 'volunteer'
  where role = 'both';

-- Drafts abandoned before the role question (migration 0008 made it nullable)
-- came in through the old combined page, which lived at /volunteer.
update public.volunteers
  set role = 'volunteer'
  where role is null;

-- Role is no longer a question — it's which page you're on — so it's known from
-- the first keystroke and can go back to being required.
alter table public.volunteers
  alter column role set not null;

alter table public.volunteers
  add constraint volunteers_role_check check (role in ('volunteer', 'mentor'));

alter table public.volunteers
  add constraint volunteers_pkey primary key (user_id, role);
