# ConstructionOS Architecture

## Current Demo Boundary

The current application is intentionally narrow: public acquisition, lead capture, a base dashboard, and a leads CRM module.

## Module Layout

- `src/modules/leads`: active demo module for opportunities.
- `src/modules/clients`: reserved for future customer account work.
- `src/modules/visits`: reserved for future site visit workflows.
- `src/modules/budgets`: reserved for future budget workflows.
- `src/modules/change-orders`: reserved for future change order workflows.
- `src/modules/ai`: reserved placeholder only; no AI implementation exists.

## Data Access

UI routes call module query functions instead of reaching directly into Supabase. This keeps the first demo usable with local sample data and makes the Supabase transition isolated.
