# PlugPay — Trust score (formula reference)

Trust is stored on `merchants.trust_score` (integer, higher = more trusted) and
computed server-side. Buyers never write to it. Inputs, in priority order:

1. **Landlord verification** (`ll_phone_verified = true`) — biggest single boost.
2. **Buyer reviews** — count × average rating (rating_avg, rating_count).
3. **Sales volume** — `sales_count` (capped so one big seller can't dominate).
4. **Engagement** — receipts recorded/sent, invoices recorded/sent, profile card
   shares, vouches given/received, neighbour comments and star ratings.
5. **Documents** — ID front/back, business licence approved by admin.
6. **Building coverage** — coverage_pct of the building (affects all stalls).

Open decisions (see checklist Part 6):
- Neighbour vouches and stars are **shown and counted in Engagement** but are
  **not yet folded into the Trust score** (weight TBD).
- Whether a seller must be landlord-verified before they can vouch/review
  neighbours is undecided.

Neighbour comments/stars are tagged "Neighbouring stall" and shown separately
from buyer reviews. Buyer reviews only come from real sales (one per sent
receipt, 6-hour window).
