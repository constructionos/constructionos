# Supabase Setup Notes

## Environment Variables

Only public browser-safe Supabase values are expected in this scaffold:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not expose or import a service role key in frontend code.

## Client Pattern

Supabase clients are created lazily through functions in `src/lib/supabase`. This keeps builds safe when local environment variables are not configured yet.
