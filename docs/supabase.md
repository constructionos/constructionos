# Supabase Setup Notes

## Environment Variables

Only public browser-safe Supabase values are expected in this scaffold:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not expose or import a service role key in frontend code.

## Migration Order

Apply migrations in order after review:

1. `src/db/migrations/0001_initial_leads.sql`
2. `src/db/migrations/0002_public_lead_capture.sql`
3. `src/db/migrations/0003_authenticated_read_grants.sql`

Do not apply migrations to production without reviewing the SQL and confirming the target project.

Migration `0003` grants `select` to the `authenticated` role for dashboard reads. RLS policies remain the real tenant boundary; do not grant anonymous reads or direct anonymous writes.

## Client Pattern

Supabase clients are created lazily through functions in `src/lib/supabase`. This keeps builds safe when local environment variables are not configured yet.

## Public Lead Capture

The public landing form creates leads through the `public.create_public_lead` RPC. The RPC resolves the MVP company internally with the `constructionos` slug, validates basic input, stores contact and opportunity details, sets safe defaults, and inserts the lead with `status = 'new'` and `priority = 'medium'`.

Captured public fields:

- opportunity title
- description
- contact name
- email
- phone
- city
- service type
- budget range
- desired timeline

The public form must not send `company_id`, and the database must not expose a direct anonymous insert policy on `public.leads`. Anonymous access is limited to `execute` on the RPC.

Dashboard routes must stay protected by Supabase Auth before reading real lead PII.

## Internal Dashboard Auth

Dashboard routes are private and require a Supabase Auth user with a membership in the ConstructionOS company.

Protected routes:

- `/dashboard`
- `/leads`
- `/leads/[id]`

Public routes:

- `/`
- `/login`
- public lead capture form

Do not enable public signup yet. Create the first admin user manually in Supabase Auth, then connect that user to the `constructionos` company with SQL reviewed in the SQL Editor.

Manual setup example:

```sql
-- Replace placeholders before running.
-- Do not use service_role in frontend code.

insert into public.profiles (id, email, full_name)
values (
  '<AUTH_USER_ID>'::uuid,
  '<ADMIN_EMAIL>',
  '<ADMIN_FULL_NAME>'
)
on conflict (id) do update
set email = excluded.email,
    full_name = excluded.full_name;

insert into public.memberships (company_id, user_id, role)
select
  companies.id,
  '<AUTH_USER_ID>'::uuid,
  'owner'::public.membership_role
from public.companies
where companies.slug = 'constructionos'
on conflict (company_id, user_id) do update
set role = excluded.role;
```

After setup, the authenticated user can read leads through RLS-backed dashboard queries. Users without a membership must not see real lead PII.
