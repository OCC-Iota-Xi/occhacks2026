-- OCC Hacks 2026 — mentor résumé, motivation, and preferred block.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Three questions only the mentor form asks. They live on `volunteers`
-- alongside everything else rather than in a mentor-only table: the row is
-- already keyed by (user_id, role), so a volunteer row simply leaves them null.
alter table public.volunteers
  add column if not exists resume_path text,
  add column if not exists mentor_reason text,
  add column if not exists preferred_time text;

-- The résumé itself goes to Storage, not to a column. The form uploads it
-- straight from the browser and posts back only the object path, which keeps
-- a multi-megabyte PDF out of the server action's request body and lets the
-- autosave treat it like any other short string answer.
--
-- Private bucket: résumés are personal, and organizers read them with the
-- service-role key or a signed URL. The MIME and size limits are enforced here
-- as well as in the form, since the browser-side check is only a courtesy.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 5242880, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['application/pdf'];

-- Every object is stored under a folder named for its owner's user id, so the
-- policies below are all the same shape: you may touch the folder that is you.
-- `storage.foldername(name)` splits the object path, and `[1]` is that folder.
drop policy if exists "mentors read own resume" on storage.objects;
create policy "mentors read own resume"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "mentors upload own resume" on storage.objects;
create policy "mentors upload own resume"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Replacing a résumé writes a fresh object rather than overwriting, so update
-- is here only for the upsert path the storage client takes internally.
drop policy if exists "mentors replace own resume" on storage.objects;
create policy "mentors replace own resume"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "mentors delete own resume" on storage.objects;
create policy "mentors delete own resume"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
