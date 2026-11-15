# PlugPay

The trust layer for Kenya's WhatsApp commerce. PlugPay verifies every seller from
Nairobi's commercial buildings, anchors every sale to a real receipt, and turns a
WhatsApp chat into a storefront buyers can actually trust.

## What is inside

- **Landing site** following the source design: dark navy + magenta system, Archivo
  Black display type, tabbed hero search (merchants and buildings), live platform
  stats from the database, WhatsApp sale demo, friction/breakthrough/contrast
  sections, free-forever pricing, community voices, market focus, FAQ and the
  deep-plum merchant CTA.
- **Explore & search** at `/search`: tabbed merchant/building directory backed by
  `GET /api/search?q=` (server-side Postgres search). Merchant cards deep-link into
  trust profiles; building cards open the floor view.
- **Merchant trust profiles** at `/sellers/[slug]` and `/m/[slug]`: verified badges,
  trust score, stats row, catalogue with WhatsApp checkout deep links,
  receipt-anchored reviews (verified buyers carry their receipt number),
  building tab with peer vouching.
- **Building pages** at `/buildings/[id]`: color-coded stall grids per floor
  (trusted / verified / registered / vacant), tap-a-stall to open the trader,
  directory search by name or street.
- **Email + password auth** for every portal (seller / landlord / agent) at
  `/seller/*`, `/landlord/*`, `/agent/*` (bare `/seller` and `/landlord` redirect
  to the dashboard): register once, sign in with the same email and password.
  No SMS/WhatsApp OTP, no one-time codes on screen.
  Passwords are scrypt-hashed with per-user salts (`app_users` table); sessions
  are HMAC-signed httpOnly cookies (`src/lib/session.ts`). A new account is a
  CLEAN account — empty catalogue, zero sales, no demo records attached.
- **Trader dashboard** at `/seller/dashboard`: record a sale with M-Pesa
  confirmation code, itemised totals, delivery choice, receipt confirmation
  state, PIN management, catalogue and invoice tabs.
- **Landlord tools** at `/landlord/dashboard`: occupancy, coverage and monthly
  verification ladder per building; stalls, sellers and documents tabs.
- **Agent tools** at `/agent`: onboarding flow for new buildings, claims queue
  and building registry.

## Stack

- Next.js 16 (App Router, RSC, server components read the DB directly)
- Tailwind CSS 4 + a ported custom design system in `src/app/globals.css`
- Supabase (Postgres) with SQL migrations in `supabase/migrations/`
- Demo sessions via HMAC-signed cookies (`src/lib/session.ts`)
- Graceful fallback: with no env vars the site renders bundled seed data, so
  CI/deploy builds never break; set env vars for live data.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase values
npm run dev
```

## Database

```bash
supabase link --project-ref <your-ref>
supabase db push
```

Migrations create buildings, stalls, merchants, products, receipts, reviews,
vouches, testimonials, FAQs, platform stats and the `app_users` email+password
auth table, then seed a realistic Nairobi CBD directory dataset (marked
`is_demo = true` in `merchants` so it can be told apart from real users).

## Verify

```bash
npm run build && npm run start          # server on :3000
bash scripts/auth_flow_test.sh http://localhost:3000   # API-level auth e2e
python3 scripts/browser_e2e.py http://localhost:3000   # browser-level auth e2e
```

`auth_flow_test.sh` covers: validation, registration, duplicate rejection,
wrong-password rejection, clean-state bootstrap (empty catalogue/sales for new
accounts), agent role signup, session, logout. `browser_e2e.py` walks the real
UI: register → clean dashboard → sign out → sign back in.

## Deploy

The live site (https://plugpay.co.ke) is a **Cloudflare Workers** deployment
built with OpenNext for Cloudflare.

1. **Cloudflare Workers via GitHub Actions** (`deploy-cloudflare.yml`): runs
   on every push to `main`. Steps: `npm ci` → `opennextjs-cloudflare build`
   (runs `npm run build` via `buildCommand` in `open-next.config.ts`) →
   `wrangler deploy`. Requires `CLOUDFLARE_API_TOKEN` in repo secrets (the
   build reuses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, all already present);
   without it the workflow exits early. `NEXT_PUBLIC_SITE_URL` is overridden
   to `https://plugpay.co.ke` in the workflow.
2. **Manual deploy**: `npm run build:cf` (or `npx opennextjs-cloudflare
   build && npx wrangler deploy`) with `CLOUDFLARE_API_TOKEN` exported.
   `wrangler.jsonc` pins the worker name (`plugpay`), compatibility date and
   `nodejs_compat`, matching the live service. Non-secret config only —
   `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET` come from the build
   environment (`scripts/gen-env.mjs` bakes them into the server bundle).
   `RESEND_API_KEY` is stored as a Worker secret (`wrangler secret put
   RESEND_API_KEY`).
3. **GitHub Actions CI** (`ci.yml`): lint + production build on every push/PR
   so a broken build never reaches deployment.

Rotating a key? Update the GitHub secret, push, and redeploy. `.env.local`
(gitignored) holds the same five values for local dev; never commit
`src/lib/env.gen.ts` with baked-in values (build rewrites it and git history
would leak the service-role key — it must keep its committed placeholders).
