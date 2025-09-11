-- Enable pgcrypto for gen_random_uuid if needed
create extension if not exists pgcrypto;

-- Rewards (stickers/badges)
create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('stamp','badge')),
  sticker_url text,
  created_at timestamp with time zone default now()
);

-- Quests
create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text,
  district text not null,
  type text not null check (type in ('qr','photo','trivia','audio')),
  reward_id uuid references public.rewards(id) on delete set null,
  qr_secret text, -- used for QR verification (Edge Function compares)
  trivia jsonb,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Profiles (mirror of auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  xp integer default 0,
  created_at timestamp with time zone default now()
);

-- User progress
create table if not exists public.user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id uuid not null references public.quests(id) on delete cascade,
  status text not null default 'completed' check (status in ('started','completed')),
  completed_at timestamp with time zone default now(),
  primary key (user_id, quest_id)
);

alter table public.rewards enable row level security;
alter table public.quests enable row level security;
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;

-- Policies
create policy "read_all_active_quests"
  on public.quests for select
  to anon, authenticated
  using (is_active = true);

create policy "read_rewards"
  on public.rewards for select
  to anon, authenticated
  using (true);

create policy "manage_own_profile"
  on public.profiles for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "read_own_progress"
  on public.user_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "upsert_own_progress"
  on public.user_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "update_own_progress"
  on public.user_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
