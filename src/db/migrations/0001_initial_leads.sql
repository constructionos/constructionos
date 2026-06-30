create extension if not exists "pgcrypto";

-- Draft initial SaaS schema.
-- Onboarding policies for creating companies and memberships are intentionally
-- omitted until the authenticated signup flow is implemented and reviewed.

create type public.membership_role as enum ('owner', 'admin', 'member');
create type public.lead_status as enum (
  'new',
  'pending_call',
  'visit_pending',
  'visit_done',
  'budget_preparing',
  'budget_sent',
  'negotiation',
  'won',
  'lost',
  'discarded'
);
create type public.lead_priority as enum ('low', 'medium', 'high');
create type public.lead_service_type as enum (
  'renovation',
  'new_build',
  'technical_direction',
  'site_coordination',
  'other'
);
create type public.budget_range as enum ('under_50k', '50k_150k', '150k_300k', 'over_300k', 'unknown');
create type public.desired_timeline as enum ('asap', '1_3_months', '3_6_months', 'more_than_6_months', 'unknown');

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.membership_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  service_type public.lead_service_type not null default 'renovation',
  zone text,
  city text not null,
  province text not null,
  estimated_budget numeric(12, 2) not null default 0,
  budget_range public.budget_range not null default 'unknown',
  desired_timeline public.desired_timeline not null default 'unknown',
  description text,
  status public.lead_status not null default 'new',
  priority public.lead_priority not null default 'medium',
  next_action text,
  next_action_date date,
  contact_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.leads enable row level security;

create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists memberships_company_id_idx on public.memberships(company_id);
create index if not exists leads_company_id_status_idx on public.leads(company_id, status);

create policy "users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "members can read their companies"
  on public.companies for select
  using (
    exists (
      select 1
      from public.memberships
      where memberships.company_id = companies.id
        and memberships.user_id = auth.uid()
    )
  );

create policy "users can read own memberships"
  on public.memberships for select
  using (user_id = auth.uid());

create policy "company members can read leads"
  on public.leads for select
  using (
    exists (
      select 1
      from public.memberships
      where memberships.company_id = leads.company_id
        and memberships.user_id = auth.uid()
    )
  );

create policy "company members can insert leads"
  on public.leads for insert
  with check (
    exists (
      select 1
      from public.memberships
      where memberships.company_id = leads.company_id
        and memberships.user_id = auth.uid()
    )
  );

create policy "company members can update leads"
  on public.leads for update
  using (
    exists (
      select 1
      from public.memberships
      where memberships.company_id = leads.company_id
        and memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.memberships
      where memberships.company_id = leads.company_id
        and memberships.user_id = auth.uid()
    )
  );

create policy "company members can delete leads"
  on public.leads for delete
  using (
    exists (
      select 1
      from public.memberships
      where memberships.company_id = leads.company_id
        and memberships.user_id = auth.uid()
    )
  );
