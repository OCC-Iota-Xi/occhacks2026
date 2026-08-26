-- OCC Hacks 2026 — count days in California, not in UTC.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Supabase databases run in UTC, so `date_trunc('day', now())` in migration
-- 0018 meant "the UTC day". For an event in Costa Mesa that's wrong by seven or
-- eight hours in the direction that matters most: everything submitted after
-- 4pm local counted as tomorrow, so "submitted today" undercounted the busiest
-- part of every day and the daily chart put an evening rush on the next bar.
--
-- Both functions are replaced whole rather than patched, so this file is the
-- current definition of each. Nothing else changes — same names, same
-- arguments, same shape of result.

create or replace function public.admin_overview_stats(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
  tz constant text := 'America/Los_Angeles';
  span int := greatest(p_days, 1);
  -- Midnight tonight-just-gone in Costa Mesa, as an absolute instant:
  -- shift now() into local time, cut it to the day, then shift back.
  today_start timestamptz := date_trunc('day', now() at time zone tz) at time zone tz;
  window_start timestamptz;
  prev_start timestamptz;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  -- A range of N days includes today, so it reaches back N-1 days.
  window_start := today_start - make_interval(days => span - 1);
  prev_start := window_start - make_interval(days => span);

  select jsonb_build_object(
    'total', count(*),
    'submitted', count(*) filter (where completed_at is not null),
    'drafts', count(*) filter (where completed_at is null),
    'today', count(*) filter (where completed_at >= today_start),
    'yesterday', count(*) filter (
      where completed_at >= today_start - interval '1 day'
        and completed_at < today_start),
    'this_week', count(*) filter (where completed_at >= today_start - interval '6 days'),
    'last_week', count(*) filter (
      where completed_at >= today_start - interval '13 days'
        and completed_at < today_start - interval '6 days'),
    'period', count(*) filter (where completed_at >= window_start),
    'prev_period', count(*) filter (
      where completed_at >= prev_start and completed_at < window_start),
    'in_review', count(*) filter (where status = 'in_review'),
    'accepted', count(*) filter (where status = 'accepted'),
    'waitlisted', count(*) filter (where status = 'waitlisted'),
    'rejected', count(*) filter (where status = 'rejected'),
    'withdrawn', count(*) filter (where status = 'withdrawn'),
    'pending_review', count(*) filter (
      where completed_at is not null and status in ('submitted','in_review')),
    'reviewed', count(*) filter (where review_count > 0),
    'confirmed', count(*) filter (where attendance = 'confirmed'),
    'declined', count(*) filter (where attendance = 'declined'),
    'checked_in', count(*) filter (where checked_in_at is not null),
    'assigned', count(*) filter (where assigned_to is not null),
    'unassigned', count(*) filter (
      where assigned_to is null and completed_at is not null),
    'eligibility_agreed', count(*) filter (where eligibility_agreed),
    'email_opt_in', count(*) filter (where email_opt_in)
  )
  into result
  from public.admin_applicants;

  return result || jsonb_build_object(
    'volunteers', (select count(*) from public.volunteers where completed_at is not null),
    'volunteer_drafts', (select count(*) from public.volunteers where completed_at is null),
    'mentors', (select count(*) from public.mentors where completed_at is not null),
    'mentor_drafts', (select count(*) from public.mentors where completed_at is null),
    'notify_optins', (select count(*) from public.notify_optins),
    'days', span
  );
end;
$$;

grant execute on function public.admin_overview_stats(int) to authenticated;

-- Each bar covers one California day: from local midnight to local midnight,
-- which is 23 or 25 hours long on the two weekends the clocks change.
create or replace function public.admin_timeseries(p_from date, p_to date)
returns table (
  day date,
  started bigint,
  submitted bigint,
  accepted bigint,
  confirmed bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tz constant text := 'America/Los_Angeles';
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  with days as (
    select
      d::date                                          as day,
      d::timestamp at time zone tz                     as starts,
      (d::timestamp + interval '1 day') at time zone tz as ends
    from generate_series(p_from, p_to, interval '1 day') d
  )
  select
    days.day,
    (select count(*) from public.hackers h
      where h.created_at >= days.starts and h.created_at < days.ends),
    (select count(*) from public.hackers h
      where h.completed_at >= days.starts and h.completed_at < days.ends),
    (select count(*) from public.application_status s
      where s.status = 'accepted'
        and s.decided_at >= days.starts and s.decided_at < days.ends),
    (select count(*) from public.application_status s
      where s.attendance = 'confirmed'
        and s.confirmed_at >= days.starts and s.confirmed_at < days.ends)
  from days
  order by days.day;
end;
$$;

grant execute on function public.admin_timeseries(date, date) to authenticated;
