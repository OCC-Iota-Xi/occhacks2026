-- OCC Hacks 2026 — the welcome-email stamp, out of the applicant's reach.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- `welcome_email_sent_at` (0004) is what stops a second welcome email, but it
-- sits on a row its owner is allowed to update. Clearing it and submitting
-- again sent another one, as many times as they liked. From here on the stamp
-- is written only by the two functions below, and a counter beside it caps how
-- often one sign-up can be claimed — so handing the slot back after a failed
-- send still works, and can't be turned into a loop.
alter table public.hackers
  add column if not exists welcome_email_attempts smallint not null default 0;

alter table public.volunteers
  add column if not exists welcome_email_attempts smallint not null default 0;

alter table public.mentors
  add column if not exists welcome_email_attempts smallint not null default 0;

-- Anyone already welcomed has used one attempt.
update public.hackers
  set welcome_email_attempts = 1
  where welcome_email_sent_at is not null and welcome_email_attempts = 0;

update public.volunteers
  set welcome_email_attempts = 1
  where welcome_email_sent_at is not null and welcome_email_attempts = 0;

update public.mentors
  set welcome_email_attempts = 1
  where welcome_email_sent_at is not null and welcome_email_attempts = 0;

-- Refuses a direct write to either column. Deliberately *not* SECURITY DEFINER:
-- `current_user` is `authenticated` for a request that came through the API,
-- and the function owner inside the SECURITY DEFINER functions below — that
-- difference is the whole check. The SQL editor passes for the same reason.
--
-- An insert is quietly reset rather than refused, so a new row always starts
-- unclaimed whatever the request carried. An update raises: silently keeping
-- the old value would report a claim that never happened as a success.
create or replace function public.guard_welcome_email()
returns trigger
language plpgsql
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.welcome_email_sent_at := null;
    new.welcome_email_attempts := 0;
  elsif new.welcome_email_sent_at is distinct from old.welcome_email_sent_at
     or new.welcome_email_attempts is distinct from old.welcome_email_attempts then
    raise exception 'welcome email bookkeeping is not writable' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_welcome_email on public.hackers;
create trigger guard_welcome_email
  before insert or update on public.hackers
  for each row execute function public.guard_welcome_email();

drop trigger if exists guard_welcome_email on public.volunteers;
create trigger guard_welcome_email
  before insert or update on public.volunteers
  for each row execute function public.guard_welcome_email();

drop trigger if exists guard_welcome_email on public.mentors;
create trigger guard_welcome_email
  before insert or update on public.mentors
  for each row execute function public.guard_welcome_email();

-- Claims the caller's own welcome slot on one table: null → now(), and reports
-- whether this call is the one that flipped it. Three attempts per sign-up,
-- which is room for a couple of failed sends and nothing more.
create or replace function public.claim_welcome_email(p_table text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed integer;
begin
  if p_table not in ('hackers', 'volunteers', 'mentors') then
    raise exception 'unknown sign-up table' using errcode = '22023';
  end if;

  execute format(
    'update public.%I
        set welcome_email_sent_at = now(),
            welcome_email_attempts = welcome_email_attempts + 1
      where user_id = auth.uid()
        and welcome_email_sent_at is null
        and welcome_email_attempts < 3',
    p_table
  );
  get diagnostics claimed = row_count;
  return claimed > 0;
end;
$$;

-- Hands the slot back so a later save retries — for a send that failed. The
-- attempt it used stays counted, which is what keeps this from being a reset.
create or replace function public.release_welcome_email(p_table text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_table not in ('hackers', 'volunteers', 'mentors') then
    raise exception 'unknown sign-up table' using errcode = '22023';
  end if;

  execute format(
    'update public.%I
        set welcome_email_sent_at = null
      where user_id = auth.uid()',
    p_table
  );
end;
$$;

revoke all on function public.claim_welcome_email(text) from public;
revoke all on function public.claim_welcome_email(text) from anon;
grant execute on function public.claim_welcome_email(text) to authenticated;

revoke all on function public.release_welcome_email(text) from public;
revoke all on function public.release_welcome_email(text) from anon;
grant execute on function public.release_welcome_email(text) to authenticated;
