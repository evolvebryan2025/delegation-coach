-- ============================================================
-- Madeea Delegation Coach — Full Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. PROFILES TABLE
-- Linked to Supabase Auth users (auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text,
  team_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. DELEGATION ASSESSMENTS TABLE
create table if not exists public.delegation_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  draining_tasks text,
  tasks_not_delegating text,
  delegation_barriers text,
  team_members text,
  ai_insights text,
  created_at timestamptz not null default now()
);

-- 3. DELEGATION PLANS TABLE
create table if not exists public.delegation_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id uuid references public.delegation_assessments(id) on delete set null,
  task_name text not null,
  team_member text,
  context text,
  autonomy_level text,
  outcome text,
  success_criteria text[],
  risks text[],
  support_needed text,
  check_in_schedule text,
  deadline timestamptz,
  handoff_message text,
  task_importance text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. FOLLOW-UPS TABLE
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delegation_plan_id uuid not null references public.delegation_plans(id) on delete cascade,
  check_in_date timestamptz not null,
  frequency text not null,
  completed boolean not null default false,
  reminder_sent boolean not null default false,
  reflection_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.delegation_assessments enable row level security;
alter table public.delegation_plans enable row level security;
alter table public.follow_ups enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- DELEGATION ASSESSMENTS policies
create policy "Users can view own assessments"
  on public.delegation_assessments for select
  using (auth.uid() = user_id);

create policy "Users can create own assessments"
  on public.delegation_assessments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own assessments"
  on public.delegation_assessments for update
  using (auth.uid() = user_id);

create policy "Users can delete own assessments"
  on public.delegation_assessments for delete
  using (auth.uid() = user_id);

-- DELEGATION PLANS policies
create policy "Users can view own plans"
  on public.delegation_plans for select
  using (auth.uid() = user_id);

create policy "Users can create own plans"
  on public.delegation_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plans"
  on public.delegation_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete own plans"
  on public.delegation_plans for delete
  using (auth.uid() = user_id);

-- FOLLOW-UPS policies
create policy "Users can view own follow-ups"
  on public.follow_ups for select
  using (auth.uid() = user_id);

create policy "Users can create own follow-ups"
  on public.follow_ups for insert
  with check (auth.uid() = user_id);

create policy "Users can update own follow-ups"
  on public.follow_ups for update
  using (auth.uid() = user_id);

create policy "Users can delete own follow-ups"
  on public.follow_ups for delete
  using (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Trigger that creates a profile row when a new user signs up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    now(),
    now()
  );
  return new;
end;
$$;

-- Drop trigger if exists (safe re-run)
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- AUTO-UPDATE updated_at TIMESTAMP
-- ============================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists update_delegation_plans_updated_at on public.delegation_plans;
create trigger update_delegation_plans_updated_at
  before update on public.delegation_plans
  for each row execute function public.update_updated_at();
