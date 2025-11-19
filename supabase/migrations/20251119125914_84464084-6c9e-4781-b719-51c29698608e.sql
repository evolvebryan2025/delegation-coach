-- Create profiles table for user data
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text,
  team_size integer,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create delegation_assessments table
create table public.delegation_assessments (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  draining_tasks text,
  tasks_not_delegating text,
  delegation_barriers text,
  team_members text,
  ai_insights text,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS on delegation_assessments
alter table public.delegation_assessments enable row level security;

-- RLS policies for delegation_assessments
create policy "Users can view their own assessments"
  on public.delegation_assessments for select
  using (auth.uid() = user_id);

create policy "Users can create their own assessments"
  on public.delegation_assessments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own assessments"
  on public.delegation_assessments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own assessments"
  on public.delegation_assessments for delete
  using (auth.uid() = user_id);

-- Create delegation_plans table
create table public.delegation_plans (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id uuid references public.delegation_assessments(id) on delete set null,
  task_name text not null,
  task_importance text,
  outcome text,
  success_criteria text[],
  context text,
  risks text[],
  support_needed text,
  check_in_schedule text,
  deadline date,
  autonomy_level text,
  status text not null default 'draft',
  team_member text,
  handoff_message text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS on delegation_plans
alter table public.delegation_plans enable row level security;

-- RLS policies for delegation_plans
create policy "Users can view their own plans"
  on public.delegation_plans for select
  using (auth.uid() = user_id);

create policy "Users can create their own plans"
  on public.delegation_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own plans"
  on public.delegation_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own plans"
  on public.delegation_plans for delete
  using (auth.uid() = user_id);

-- Create follow_ups table
create table public.follow_ups (
  id uuid not null default gen_random_uuid() primary key,
  delegation_plan_id uuid not null references public.delegation_plans(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  check_in_date date not null,
  frequency text not null,
  reminder_sent boolean not null default false,
  completed boolean not null default false,
  reflection_notes text,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS on follow_ups
alter table public.follow_ups enable row level security;

-- RLS policies for follow_ups
create policy "Users can view their own follow_ups"
  on public.follow_ups for select
  using (auth.uid() = user_id);

create policy "Users can create their own follow_ups"
  on public.follow_ups for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own follow_ups"
  on public.follow_ups for update
  using (auth.uid() = user_id);

create policy "Users can delete their own follow_ups"
  on public.follow_ups for delete
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

create trigger update_delegation_plans_updated_at
  before update on public.delegation_plans
  for each row
  execute function public.update_updated_at_column();

-- Create function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- Create trigger for auto-creating profiles on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();