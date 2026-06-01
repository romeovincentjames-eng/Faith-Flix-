create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'user');
create type public.publish_status as enum ('draft', 'published', 'hidden');
create type public.review_status as enum ('pending_review', 'approved', 'rejected', 'edits_requested');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  name text not null default '',
  username text unique,
  bio text,
  favorite_scripture text,
  profile_image_url text,
  church_ministry_name text,
  location text,
  birthday date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  hidden boolean not null default false,
  custom boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  poster_url text,
  scripture_theme text,
  category_id uuid references public.categories(id) on delete set null,
  status public.publish_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'admin',
  title text not null,
  description text,
  scripture_reference text,
  category_id uuid references public.categories(id) on delete set null,
  series_id uuid references public.series(id) on delete set null,
  episode_number text,
  duration text,
  creator_ministry_name text,
  tags text,
  video_url text,
  thumbnail_url text,
  status public.publish_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  scripture_reference text,
  category_id uuid references public.categories(id) on delete set null,
  testimony_type text,
  visibility text not null default 'Public',
  tags text,
  video_url text,
  thumbnail_url text,
  status public.review_status not null default 'pending_review',
  admin_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  user_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.video_likes (
  video_id uuid references public.videos(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, user_id)
);

create table public.video_saves (
  video_id uuid references public.videos(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, user_id)
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  body text not null,
  scripture_reference text,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  visibility text not null default 'Public',
  answered boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references public.profiles(id) on delete cascade,
  to_user_id uuid references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (from_user_id, to_user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references public.profiles(id) on delete cascade,
  to_user_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.series enable row level security;
alter table public.videos enable row level security;
alter table public.user_uploads enable row level security;
alter table public.comments enable row level security;
alter table public.video_likes enable row level security;
alter table public.video_saves enable row level security;
alter table public.community_posts enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.friend_requests enable row level security;
alter table public.messages enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

create policy "profiles are readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "public visible categories" on public.categories for select using (hidden = false or public.is_admin());
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "public published series" on public.series for select using (status = 'published' or public.is_admin());
create policy "admins manage series" on public.series for all using (public.is_admin()) with check (public.is_admin());

create policy "public published videos" on public.videos for select using (status = 'published' or public.is_admin());
create policy "admins manage videos" on public.videos for all using (public.is_admin()) with check (public.is_admin());

create policy "users see own uploads" on public.user_uploads for select using (auth.uid() = user_id or public.is_admin());
create policy "users create own uploads" on public.user_uploads for insert with check (auth.uid() = user_id);
create policy "admins review uploads" on public.user_uploads for update using (public.is_admin()) with check (public.is_admin());

create policy "comments readable" on public.comments for select using (true);
create policy "signed in users comment" on public.comments for insert with check (auth.uid() = user_id);

create policy "users manage own likes" on public.video_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own saves" on public.video_saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "community posts readable" on public.community_posts for select using (true);
create policy "users create posts" on public.community_posts for insert with check (auth.uid() = user_id);
create policy "users update own posts" on public.community_posts for update using (auth.uid() = user_id);

create policy "public prayer requests readable" on public.prayer_requests for select using (visibility = 'Public' or auth.uid() = user_id or public.is_admin());
create policy "users create prayer requests" on public.prayer_requests for insert with check (auth.uid() = user_id);
create policy "users update own prayer requests" on public.prayer_requests for update using (auth.uid() = user_id);

create policy "friend requests visible to participants" on public.friend_requests for select using (auth.uid() in (from_user_id, to_user_id));
create policy "users send friend requests" on public.friend_requests for insert with check (auth.uid() = from_user_id);
create policy "participants update friend requests" on public.friend_requests for update using (auth.uid() in (from_user_id, to_user_id));

create policy "messages visible to participants" on public.messages for select using (auth.uid() in (from_user_id, to_user_id));
create policy "users send messages" on public.messages for insert with check (auth.uid() = from_user_id);

insert into public.categories (name, hidden, custom) values
  ('Bible Stories', false, false),
  ('Sermons', false, false),
  ('Worship Videos', false, false),
  ('Testimonies', false, false),
  ('Prayer Videos', false, false),
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
  ('Prayer Room Content', false, false),
  ('Answered Prayer Stories', false, false),
  ('Faith Journey Videos', false, false)
on conflict (name) do nothing;
