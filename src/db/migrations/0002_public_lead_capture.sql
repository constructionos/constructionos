alter table public.companies
  add column if not exists slug text;

update public.companies
set slug = lower(trim(both '-' from regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')))
where slug is null
  and nullif(trim(name), '') is not null;

update public.companies
set slug = 'company-' || id::text
where slug is null
  or slug = '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'companies_slug_key'
      and conrelid = 'public.companies'::regclass
  ) then
    alter table public.companies
      add constraint companies_slug_key unique (slug);
  end if;
end $$;

insert into public.companies (name, slug)
values ('ConstructionOS', 'constructionos')
on conflict (slug) do update
set name = excluded.name,
    updated_at = now();

create index if not exists leads_company_id_created_at_idx
  on public.leads(company_id, created_at desc);

drop function if exists public.create_public_lead(
  text,
  text,
  text,
  text,
  public.lead_service_type,
  text
);

create or replace function public.create_public_lead(
  p_title text,
  p_contact_name text,
  p_email text,
  p_city text,
  p_service_type public.lead_service_type,
  p_phone text,
  p_description text,
  p_budget_range public.budget_range,
  p_desired_timeline public.desired_timeline,
  p_honeypot text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_city text := nullif(trim(p_city), '');
  v_company_id uuid;
  v_contact_name text := nullif(trim(p_contact_name), '');
  v_description text := nullif(trim(p_description), '');
  v_email text := lower(nullif(trim(p_email), ''));
  v_lead_id uuid;
  v_phone text := nullif(trim(p_phone), '');
  v_title text := nullif(trim(p_title), '');
begin
  if nullif(trim(coalesce(p_honeypot, '')), '') is not null then
    raise exception 'Invalid lead submission.' using errcode = '22023';
  end if;

  if v_title is null or char_length(v_title) < 3 or char_length(v_title) > 200 then
    raise exception 'Invalid lead title.' using errcode = '22023';
  end if;

  if v_contact_name is null or char_length(v_contact_name) < 2 or char_length(v_contact_name) > 160 then
    raise exception 'Invalid contact name.' using errcode = '22023';
  end if;

  if v_email is null
    or char_length(v_email) > 254
    or v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Invalid email.' using errcode = '22023';
  end if;

  if v_city is null or char_length(v_city) < 2 or char_length(v_city) > 120 then
    raise exception 'Invalid city.' using errcode = '22023';
  end if;

  if v_phone is null or char_length(v_phone) < 6 or char_length(v_phone) > 40 then
    raise exception 'Invalid phone.' using errcode = '22023';
  end if;

  if v_phone !~ '^[0-9+(). -]+$' then
    raise exception 'Invalid phone.' using errcode = '22023';
  end if;

  if v_description is null or char_length(v_description) < 10 or char_length(v_description) > 2000 then
    raise exception 'Invalid description.' using errcode = '22023';
  end if;

  if p_budget_range is null then
    raise exception 'Invalid budget range.' using errcode = '22023';
  end if;

  if p_desired_timeline is null then
    raise exception 'Invalid desired timeline.' using errcode = '22023';
  end if;

  select id
  into v_company_id
  from public.companies
  where slug = 'constructionos';

  if v_company_id is null then
    raise exception 'Lead capture company is not configured.' using errcode = '23503';
  end if;

  insert into public.leads (
    budget_range,
    city,
    company_id,
    contact_name,
    description,
    desired_timeline,
    email,
    estimated_budget,
    next_action,
    phone,
    priority,
    province,
    service_type,
    status,
    title
  )
  values (
    p_budget_range,
    v_city,
    v_company_id,
    v_contact_name,
    v_description,
    p_desired_timeline,
    v_email,
    0,
    'Contactar lead',
    v_phone,
    'medium',
    'Por definir',
    p_service_type,
    'new',
    v_title
  )
  returning id into v_lead_id;

  return v_lead_id;
end;
$$;

revoke all on function public.create_public_lead(
  text,
  text,
  text,
  text,
  public.lead_service_type,
  text,
  text,
  public.budget_range,
  public.desired_timeline,
  text
) from public;

grant execute on function public.create_public_lead(
  text,
  text,
  text,
  text,
  public.lead_service_type,
  text,
  text,
  public.budget_range,
  public.desired_timeline,
  text
) to anon;
