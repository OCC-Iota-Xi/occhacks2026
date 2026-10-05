-- OCC Hacks 2026 — "I've sent my waivers".
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- An accepted applicant confirms their spot by emailing signed waivers to two
-- organizers. Until now the status page couldn't tell "hasn't sent them" from
-- "sent them, nobody has looked yet". `waivers_sent_at` is the applicant's own
-- word that the email went out; an organizer then finds the forms and marks
-- attendance confirmed, which is what the status page reads as "you're in".
alter table public.application_status
  add column if not exists waivers_sent_at timestamptz;

-- Applicants can read their decision row but not write it, and that stays
-- true: an update policy would have to trust them with `status` as well. This
-- function is the one write they get — it stamps their own row, only once, and
-- only if they've been accepted.
create or replace function public.mark_waivers_sent()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.application_status
     set waivers_sent_at = now()
   where user_id = auth.uid()
     and status = 'accepted'
     and waivers_sent_at is null;
  return found;
end;
$$;

revoke all on function public.mark_waivers_sent() from public;
revoke all on function public.mark_waivers_sent() from anon;
grant execute on function public.mark_waivers_sent() to authenticated;

-- 0018's trigger function with one more clause, so the applicant's click shows
-- up in their activity history next to the organizer's confirmation.
create or replace function public.trg_log_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status is distinct from 'submitted' then
      perform public.log_activity(new.user_id, 'status',
        'Status set to ' || new.status, jsonb_build_object('to', new.status));
    end if;
    if new.assigned_to is not null then
      perform public.log_activity(new.user_id, 'assignment', 'Assigned for review',
        jsonb_build_object('to', new.assigned_to));
    end if;
    return new;
  end if;

  if new.status is distinct from old.status then
    perform public.log_activity(new.user_id, 'status',
      'Status changed ' || old.status || ' → ' || new.status,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;

  if new.attendance is distinct from old.attendance then
    perform public.log_activity(new.user_id, 'attendance',
      'Attendance ' || old.attendance || ' → ' || new.attendance,
      jsonb_build_object('from', old.attendance, 'to', new.attendance));
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    perform public.log_activity(new.user_id, 'assignment',
      case when new.assigned_to is null then 'Unassigned' else 'Assigned for review' end,
      jsonb_build_object('to', new.assigned_to));
  end if;

  if new.checked_in_at is distinct from old.checked_in_at then
    perform public.log_activity(new.user_id, 'checkin',
      case when new.checked_in_at is null then 'Check-in undone' else 'Checked in' end);
  end if;

  if new.waivers_sent_at is distinct from old.waivers_sent_at then
    perform public.log_activity(new.user_id, 'waivers',
      case when new.waivers_sent_at is null then 'Waivers marked not sent'
           else 'Applicant says waivers were sent' end);
  end if;

  return new;
end;
$$;

-- `create or replace` again, as in 0023: the new columns go last and everything
-- above them is unchanged.
create or replace view public.admin_applicants
with (security_invoker = on) as
select
  h.user_id                                as id,
  h.email,
  h.full_name,
  h.school,
  h.major,
  h.occ_id,
  h.phone,
  h.dob,
  h.shirt,
  h.needs,
  h.classes,
  h.iota_xi,
  h.rank_entertainment,
  h.rank_education,
  h.rank_productivity,
  h.eligibility_agreed,
  h.email_opt_in,
  h.welcome_email_sent_at,
  h.completed_at,
  h.created_at,
  h.updated_at,
  -- No decision row yet means nobody has touched them: a finished sign-up is
  -- 'submitted' and waiting, an unfinished one is still a draft.
  coalesce(s.status, case when h.completed_at is null then 'draft' else 'submitted' end) as status,
  coalesce(s.attendance, 'pending')        as attendance,
  s.assigned_to,
  admin.display_name                       as assigned_name,
  admin.email                              as assigned_email,
  s.decided_at,
  s.confirmed_at,
  s.checked_in_at,
  (s.checked_in_at is not null)            as checked_in,
  coalesce(r.review_count, 0)              as review_count,
  r.avg_score,
  coalesce(t.tags, array[]::text[])        as tags,
  case
    when h.rank_entertainment = 1 then 'entertainment'
    when h.rank_education = 1 then 'education'
    when h.rank_productivity = 1 then 'productivity'
  end                                      as first_choice_track,
  case when h.dob is null then null
       else extract(year from age(h.dob))::int end as age,
  -- Data-quality flags, computed once here so the operations filters are a
  -- plain equality rather than five clauses repeated in the client.
  (h.completed_at is not null and (
     h.full_name is null or h.email is null or h.school is null
     or h.major is null or h.shirt is null or h.dob is null
   ))                                      as flag_missing_info,
  (h.email is not null
     and count(*) filter (where h.email is not null)
         over (partition by lower(h.email)) > 1) as flag_duplicate_email,
  (h.completed_at is not null and coalesce(r.review_count, 0) = 0) as flag_unreviewed,
  (coalesce(s.status, '') = 'accepted' and coalesce(s.attendance, 'pending') <> 'confirmed') as flag_unconfirmed,
  (h.completed_at is null and h.created_at < now() - interval '3 days') as flag_stale_draft,
  -- Where this application sits on the timeline: when it was submitted, or for
  -- a draft, when it was started.
  coalesce(h.completed_at, h.created_at)    as timeline_at,
  -- When the applicant said they emailed their signed waivers, and whether an
  -- organizer still has to go and look for them.
  s.waivers_sent_at,
  (coalesce(s.status, '') = 'accepted'
     and s.waivers_sent_at is not null
     and coalesce(s.attendance, 'pending') = 'pending') as flag_waivers_to_review
from public.hackers h
left join public.application_status s on s.user_id = h.user_id
left join public.admin_users admin on admin.user_id = s.assigned_to
left join lateral (
  select count(*)::int as review_count, round(avg(overall), 2) as avg_score
  from public.application_reviews rv
  where rv.applicant_id = h.user_id
) r on true
left join lateral (
  select array_agg(tg.name order by tg.name) as tags
  from public.applicant_tags at
  join public.tags tg on tg.id = at.tag_id
  where at.applicant_id = h.user_id
) t on true;
