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

Do not apply migrations to production without reviewing the SQL and confirming the target project.

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

Dashboard routes still use demo data until authentication and tenant-aware access are implemented, so real lead PII is not exposed in public routes.
