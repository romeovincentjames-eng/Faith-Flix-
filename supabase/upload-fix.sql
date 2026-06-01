-- Run this in Supabase SQL Editor to enable real Faith Flix video uploads.

alter table public.videos add column if not exists app_category text;
alter table public.videos add column if not exists app_series_title text;
alter table public.videos add column if not exists crop_dimension text;
alter table public.videos add column if not exists crop_ratio text;

insert into storage.buckets (id, name, public)
values ('faithflix-media', 'faithflix-media', true)
on conflict (id) do update set public = true;

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
