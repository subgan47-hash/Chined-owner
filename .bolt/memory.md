# Project memory

## Product intent & audience

- App with e-commerce / pricing features: manages `products`, `orders`, `price_proofs`, and `app_settings`.
- Likely a price-tracking or storefront product where pricing provenance (`price_proofs`) matters.

## Brand personality & voice

- Not yet inferred; no copy or branding artifacts encountered.

## Visual design & UX direction

- Not yet inferred from UI; only backend wiring confirmed so far.

## Decisions, constraints & rationale

- Stack: Vite + React.
- Backend: Supabase (Bolt Cloud–provisioned project `xhiyoajxdjqabcjgpqrj`).
- Env binding: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` live in `.env`; connection verified against live DB.
- Schema: four tables (`products`, `app_settings`, `price_proofs`, `orders`); RLS enabled on all.
- No env changes were needed this turn — secrets already bound and DB reachable.

## Open questions & assumptions

- Service-role key not mentioned; assume client-only access via anon key + RLS for now.
- Exact app domain (storefront vs. internal pricing tool) unconfirmed.
- Auth strategy and RLS policies not yet inspected.