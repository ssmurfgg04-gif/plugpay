# PlugPay

The trust layer for Kenya's WhatsApp commerce. PlugPay verifies every seller from
Nairobi's commercial buildings, anchors every sale to a real receipt, and turns a
WhatsApp chat into a storefront buyers can actually trust.

## What is inside

- **Landing site** following the source design: dark navy + magenta system, Archivo
  Black display type, tabbed hero search (merchants and buildings), live platform
  stats from the database, WhatsApp sale demo, friction/breakthrough/contrast
  sections, free-forever pricing, community voices, market focus, FAQ and the blue
  merchant CTA.
- **Merchant trust profiles** at `/m/[slug]`: verified badges with dates, trust
  score, stats row, catalogue with WhatsApp checkout deep links, receipt-anchored
  reviews (verified buyers carry their receipt number), building tab with peer
  vouching.
- **Building floor maps** at `/buildings` and `/buildings/[slug]`: color-coded stall
  grids per floor (trusted / verified / registered / vacant), tap-a-stall to open the
  trader, directory search by name or street.
- **Phone auth with demo OTP** at `/signin`: Kenyan number validation, 6-digit code
  surfaced on screen (demo mode; production swaps in Twilio Verify or the Supabase
  send-SMS hook), PIN login fallback with scrypt hashing.
- **Trader dashboard** at `/dashboard`: record a sale with M-Pesa confirmation code,
  itemised totals, delivery choice, receipt confirmation state, PIN management.
- **Landlord tools** at `/landlord`: occupancy, coverage and monthly verification
  ladder per building.

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
vouches, testimonials, FAQs, platform stats and demo OTP storage, then seed a
realistic Nairobi CBD dataset.

## Deploy to Netlify

1. Push this repo to GitHub.
2. Netlify: Add new site > Import from Git.
3. Build command `npm run build`, the Netlify Next.js plugin is wired in
   `netlify.toml`.
4. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (mark as secret),
   `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`.
5. Deploy.
