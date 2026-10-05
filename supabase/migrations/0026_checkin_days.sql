-- OCC Hacks 2026 — check-in on both days.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The event runs October 10 and 11 and people check in each morning.
-- `checked_in_at` has only ever meant "arrived", so it stays as day 1 — the
-- dashboard counts, the email audiences and the export all keep working — and
-- day 2 gets a column of its own beside it.
--
-- Until this has run, day 1 check-in works as before and the check-in page says
-- day 2 isn't set up.
alter table public.application_status
  add column if not exists checked_in_day2_at timestamptz;

-- `create or replace` again, as in 0023 and 0024: the new column goes last and
-- everything above it is unchanged.
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
     and coalesce(s.attendance, 'pending') = 'pending') as flag_waivers_to_review,
  -- The second day's check-in. `checked_in_at` and `checked_in` above stay day 1.
  s.checked_in_day2_at
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

-- The API caches the table's shape; without this it can keep refusing the new
-- column for a while after the statement above succeeds.
notify pgrst, 'reload schema';
