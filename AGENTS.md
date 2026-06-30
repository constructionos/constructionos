# ConstructionOS Agent Guidelines

## Scope

ConstructionOS is a Next.js App Router SaaS scaffold for the first demo phase:

- public landing page
- lead capture form
- initial opportunities CRM
- base dashboard
- leads module
- Supabase-ready structure

## Hard Limits

- Do not implement AI features yet.
- Do not implement payments.
- Do not implement a client portal.
- Do not implement a marketplace.
- Do not implement inventory.
- Do not hardcode secrets.
- Do not commit `.env.local`.
- Do not use a Supabase service role key in frontend code.
- Do not deploy or push without explicit confirmation.

## Architecture

- Keep route UI under `src/app`.
- Keep reusable layout and UI components under `src/components`.
- Keep domain logic under `src/modules`.
- Keep Supabase clients under `src/lib/supabase`.
- Keep server-only cross-cutting code under `src/server`.
- Keep migrations under `src/db/migrations`.

## Verification

Run these before handing work back:

```bash
npm run lint
npm run build
npm run typecheck
```
