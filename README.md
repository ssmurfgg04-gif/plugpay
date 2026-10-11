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
  Netlify builds never break; set env vars for live data.

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

Two supported paths:

1. **Netlify (current live site: https://plugnply.netlify.app).** Build command
   `npm run build`, the Netlify Next.js plugin is wired in `netlify.toml`.
   - CI/CD: `deploy-netlify.yml` runs on every push to `main`. It builds with the
     encrypted GitHub repo secrets and deploys with `NETLIFY_AUTH_TOKEN` +
     `NETLIFY_SITE_ID`. Add those two secrets once and every push ships
     automatically. Without them the workflow still runs lint + build as CI.
   - Environment variables ship in two places:
     - `netlify.toml [build.environment]` carries the five runtime vars so
       manual builds render live Supabase data out of the box.
     - The same five are mirrored as encrypted GitHub Actions repo secrets
       (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
       `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET`).
   - Rotating a key? Update the Netlify UI value first, then strip it from
     `netlify.toml` in the same commit.
2. **GitHub Actions CI** (`ci.yml`): lint + production build on every push/PR
   so a broken build never reaches deployment.
