do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'lead_source'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.lead_source as enum (
      'web',
      'whatsapp',
      'phone',
      'manual',
      'referral',
      'ads'
    );
  end if;
end $$;

alter table public.leads
  add column if not exists source public.lead_source not null default 'web';
