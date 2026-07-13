-- =========================================================
-- SOCIAL PHOTO APP — SUPABASE SCHEMA
-- Run this in the Supabase SQL editor (or via CLI migration)
-- =========================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "uuid-ossp";

-- ---------- 1. PROFILES ----------
-- Extends Supabase's built-in auth.users table with public profile info.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)) || '_' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- 2. POSTS ----------
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_id_idx on public.posts (user_id);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Users can insert their own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

-- ---------- 3. COMMENTS ----------
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Users can insert their own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- ---------- 4. REACTIONS ----------
-- One reaction per user per post. Changing reaction = update the row (upsert).
create table if not exists public.reactions (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('like', 'heart', 'laugh', 'wow', 'sad')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists reactions_post_id_idx on public.reactions (post_id);

alter table public.reactions enable row level security;

create policy "Reactions are viewable by everyone"
  on public.reactions for select
  using (true);

create policy "Users can insert their own reactions"
  on public.reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reactions"
  on public.reactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reactions"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- ---------- 5. STORAGE ----------
-- Create a public bucket for post images (do this once).
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Anyone can view post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

create policy "Users can delete their own post images"
  on storage.objects for delete
  using (bucket_id = 'post-images' and owner = auth.uid());

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update/delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and owner = auth.uid());

-- ---------- 6. HELPFUL VIEW: post feed with counts ----------
create or replace view public.post_feed as
select
  p.id,
  p.user_id,
  p.image_url,
  p.caption,
  p.created_at,
  pr.username,
  pr.display_name,
  pr.avatar_url,
  (select count(*) from public.comments c where c.post_id = p.id) as comment_count,
  (select count(*) from public.reactions r where r.post_id = p.id) as reaction_count
from public.posts p
join public.profiles pr on pr.id = p.user_id
order by p.created_at desc;
