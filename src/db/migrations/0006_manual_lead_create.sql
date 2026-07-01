alter table public.leads
  alter column email drop not null;

grant insert (
  company_id,
  title,
  contact_name,
  email,
  phone,
  service_type,
  zone,
  city,
  province,
  estimated_budget,
  budget_range,
  desired_timeline,
  description,
  status,
  priority,
  next_action,
  next_action_date,
  source
)
on public.leads
to authenticated;
