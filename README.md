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
- **Explore map** at `/map`: Nextdoor-style live map of every verified building in
  Nairobi CBD. Photo pins carry a trader-count pill, hover cards show name plus
  "N verified traders · area", a floating trade filter sits over the map, results
  live in a split sidebar (404px) on desktop and a sheet under a 40vh map strip on
  mobile. Includes a "Near me" geolocation sort with haversine distances, two-stage
  tap on touch, pin↔card cross-highlighting, Google Maps directions and WhatsApp
  share on every card. Leaflet + Esri light-gray canvas tiles, repainted via a
  layer group without map rebuilds, `fitBounds` after filtering.
- **Merchant trust profiles** at `/m/[slug]`: verified badges with dates, trust
  score, stats row, catalogue with WhatsApp checkout deep links, receipt-anchored
  reviews (verified buyers carry their receipt number), building tab with peer
  vouching.
- **Building floor maps** at `/buildings` and `/buildings/[slug]`: color-coded stall
  grids per floor (trusted / verified / registered / vacant), tap-a-stall to open the
  trader, directory search by name or street, 3-column desktop grid.
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
2. Netlify: Add new site > Import from Git. The site auto-deploys on every push
   (live: https://plugnply.netlify.app).
3. Build command `npm run build`, the Netlify Next.js plugin is wired in
   `netlify.toml`.
4. Environment variables ship in two places:
   - `netlify.toml [build.environment]` carries the five runtime vars so builds
     render live Supabase data out of the box.
   - The same five are mirrored as encrypted GitHub Actions repo secrets
     (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET`).
   - Rotating a key? Update the Netlify UI value first, then strip it from
     `netlify.toml` in the same commit.
5. Deploy.
