alter table public.companies
  add column if not exists public_intake_enabled boolean not null default false;

update public.companies
set public_intake_enabled = true,
    updated_at = now()
where slug = 'constructionos';

create or replace function public.create_public_lead_for_company(
  p_company_slug text,
  p_title text,
  p_contact_name text,
  p_email text,
  p_city text,
  p_service_type public.lead_service_type,
  p_phone text default null,
  p_description text default null,
  p_budget_range public.budget_range default null,
  p_desired_timeline public.desired_timeline default null,
  p_honeypot text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_budget_range public.budget_range := coalesce(p_budget_range, 'unknown'::public.budget_range);
  v_city text := nullif(trim(p_city), '');
  v_company_id uuid;
  v_company_slug text := lower(nullif(trim(p_company_slug), ''));
  v_contact_name text := nullif(trim(p_contact_name), '');
  v_description text := nullif(trim(p_description), '');
  v_desired_timeline public.desired_timeline := coalesce(p_desired_timeline, 'unknown'::public.desired_timeline);
  v_email text := lower(nullif(trim(p_email), ''));
  v_lead_id uuid;
  v_phone text := nullif(trim(p_phone), '');
  v_title text := nullif(trim(p_title), '');
begin
  if nullif(trim(coalesce(p_honeypot, '')), '') is not null then
    raise exception 'Invalid lead submission.' using errcode = '22023';
  end if;

  if v_company_slug is null or v_company_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Public intake not available.' using errcode = '22023';
  end if;

  if v_title is null or char_length(v_title) < 3 or char_length(v_title) > 200 then
    raise exception 'Invalid lead title.' using errcode = '22023';
  end if;

  if v_contact_name is null or char_length(v_contact_name) < 2 or char_length(v_contact_name) > 160 then
    raise exception 'Invalid contact name.' using errcode = '22023';
  end if;

  if v_email is not null then
    if char_length(v_email) > 254 or v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
      raise exception 'Invalid email.' using errcode = '22023';
    end if;
  end if;

  if v_city is null or char_length(v_city) < 2 or char_length(v_city) > 120 then
    raise exception 'Invalid city.' using errcode = '22023';
  end if;

  if v_phone is not null then
    if char_length(v_phone) < 6 or char_length(v_phone) > 40 or v_phone !~ '^[0-9+(). -]+$' then
      raise exception 'Invalid phone.' using errcode = '22023';
    end if;
  end if;

  if v_email is null and v_phone is null then
    raise exception 'At least one contact method is required.' using errcode = '22023';
  end if;

  if v_description is not null then
    if char_length(v_description) < 10 or char_length(v_description) > 2000 then
      raise exception 'Invalid description.' using errcode = '22023';
    end if;
  end if;

  select id
  into v_company_id
  from public.companies
  where slug = v_company_slug
    and public_intake_enabled = true;

  if v_company_id is null then
    raise exception 'Public intake not available.' using errcode = '23503';
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
    source,
    status,
    title
  )
  values (
    v_budget_range,
    v_city,
    v_company_id,
    v_contact_name,
    v_description,
    v_desired_timeline,
    v_email,
    0,
    'Contactar lead',
    v_phone,
    'medium',
    'Por definir',
    p_service_type,
    'web',
    'new',
    v_title
  )
  returning id into v_lead_id;

  return v_lead_id;
end;
$$;

revoke all on function public.create_public_lead_for_company(
  text,
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

grant execute on function public.create_public_lead_for_company(
  text,
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
