-- OCC Hacks 2026 — `completed_at` goes back to meaning the first submit.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The registration form stamps `completed_at = now()` on every submit, and
-- "update my application" is the same submit. So the date an organizer read as
-- "submitted" was really the last time the applicant saved, and anyone who
-- fixed a typo jumped to the top of the applicant list. `updated_at` already
-- records the last edit; `completed_at` should stay put once it's set.

-- 1. Put back the dates that have already been overwritten. Nothing stored the
--    first submit as such, but two things were stamped at that moment and never
--    again: the 'submitted' entry in the activity log (0018), and the welcome
--    email claim (0004, which for the rows older than it is the day they signed
--    up). The earliest of those and the current value is the first submit.
update public.hackers h
  set completed_at = least(
    h.completed_at,
    h.welcome_email_sent_at,
    (select min(a.created_at)
       from public.application_activity a
      where a.applicant_id = h.user_id
        and a.kind = 'submitted')
  )
  where h.completed_at is not null;

-- 2. Keep it from happening again. Once a row has a `completed_at`, a request
--    through the API can't move it — the form goes on sending `now()` with
--    every save and this quietly keeps the original.
--
--    Not SECURITY DEFINER, for the same reason as `guard_welcome_email` (0025):
--    `current_user` is `authenticated` for an API request and the owner in the
--    SQL editor, so a date can still be corrected by hand from there.
create or replace function public.keep_first_submission()
returns trigger
language plpgsql
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if old.completed_at is not null then
    new.completed_at := old.completed_at;
  end if;

  return new;
end;
$$;

drop trigger if exists keep_first_submission on public.hackers;
create trigger keep_first_submission
  before update on public.hackers
  for each row execute function public.keep_first_submission();
