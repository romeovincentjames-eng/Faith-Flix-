-- Run this in Supabase SQL Editor to enable real Faith Flix video uploads.
-- This is safe to run more than once.

alter table public.videos add column if not exists app_category text;
alter table public.videos add column if not exists app_series_title text;
alter table public.videos add column if not exists crop_dimension text;
alter table public.videos add column if not exists crop_ratio text;
alter table public.videos add column if not exists featured boolean not null default false;

alter table public.series add column if not exists app_category text;
alter table public.series add column if not exists featured boolean not null default false;

insert into public.categories (name, hidden, custom)
values
  ('Bible Stories', false, false),
  ('Sermons', false, false),
  ('Worship Videos', false, false),
  ('Testimonies', false, false),
  ('Christian Short Films', false, false),
  ('Faith Music Visuals', false, false),
  ('Gospel Messages', false, false),
  ('Christian Motivation', false, false),
  ('Youth Faith Content', false, false),
  ('Family Faith Content', false, false),
  ('Vertical Faith Series', false, false),
  ('Animated Bible Stories', false, false),
  ('Church Clips', false, false),
  ('Pastor Teachings', false, false),
  ('Faith Trailers', false, false),
  ('Scripture Reflections', false, false),
  ('Devotional Clips', false, false),
  ('Bible Study Content', false, false),
  ('Christian Creator Videos', false, false),
  ('Church Media', false, false),
  ('Faith Journey Videos', false, false)
on conflict (name) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
values ('faithflix-media', 'faithflix-media', true, 524288000)
on conflict (id) do update set public = true, file_size_limit = 524288000;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'videos'
      and policyname = 'signed in users create published videos'
  ) then
    create policy "signed in users create published videos"
    on public.videos
    for insert
    with check (
      auth.uid() = created_by
      and source = 'user'
      and status = 'published'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'faithflix media public read'
  ) then
    create policy "faithflix media public read"
    on storage.objects
    for select
    using (bucket_id = 'faithflix-media');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'faithflix users upload own media'
  ) then
    create policy "faithflix users upload own media"
    on storage.objects
    for insert
    with check (
      bucket_id = 'faithflix-media'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;
