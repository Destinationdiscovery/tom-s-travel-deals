# Plan: Smart Hero Search + Newsletter Removal + Nav Polish

## 1. Universal hero search across all 8 tools

Today the hero search only routes to two places: a listicle page (`/reviews/:query`) or single hotel review generation. A prompt like "packing list for Italy in July" or "entry requirements for Cuba" gets misrouted to the review flow.

### Add an intent router

Extend `src/lib/searchIntent.ts` with a second classifier `classifyToolIntent(query)` that returns one of:

- `gear` (keywords: pack, packing, what to bring, suitcase, luggage, gear)
- `safety` (safe, safety, dangerous, crime, advisory, is it safe)
- `visa` (visa, entry requirement, passport, customs, do I need)
- `best-time` (best time, when to visit, weather in, season, monsoon)
- `currency` (currency, exchange rate, how much is, tipping, cash)
- `flights` (flight, fly to, cheap flights, airline, airfare)
- `itinerary` (itinerary, days in, X day, plan a trip to, week in)
- `intel` (know before you go, travel intel, customs etiquette, language tips)
- `null` (no tool match, fall back to existing review/listicle flow)

Order matters: visa/safety checked before generic question starters so "do I need a visa for Cuba" doesn't fall to listicle.

### Update hero handler in `src/pages/Index.tsx`

```text
handleHeroSearch(query):
  tool = classifyToolIntent(query)
  if tool: navigate(`/${toolRoute[tool]}?q=${encodeURIComponent(query)}`)
  else: existing listicle vs review flow
```

`toolRoute` maps to: `gear`, `safety`, `safety` (visa folds into safety for now since there is no /visa page), `best-time`, `currency`, `flights`, `itinerary`, `travel-intel`.

### Auto-run on each tool page

For the 7 tool pages (`Gear`, `Safety`, `BestTime`, `Currency`, `Flights`, `Itinerary`, `TravelIntel`), on mount read `?q=` from URL. If present, prefill the page's primary input and trigger the same submit handler the user would. No new UI, just wired-up auto-run.

This makes the hero a true answer engine: one search bar, eight destinations.

## 2. Remove Compass Weekly newsletter sitewide

`NewsletterCTASection` (heading "The Compass Weekly", subtitle "Get hand-picked travel deals, packing tips, and travel news") is rendered inside `Footer.tsx` (line 27), so it shows on every page.

- Remove the `<NewsletterCTASection />` mount and the import from `src/components/Footer.tsx`.
- Leave the component file in place (no other consumers). Marked as unused, safe to delete in a later pass.

Result: no Compass Weekly block anywhere on the site.

## 3. Header refinements (logged-in only)

Header today already has the structure you described except the active-trip quick link.

- ✅ Public nav: Home, Blog, Guides, Deals, Tools dropdown, My Trips (primary button) — already in place.
- ✅ Avatar circle with user initial — already in place.
- ✅ Admin "Dashboard" link stays (visible only when `isAdmin`, kept per your earlier request to preserve admin dashboard).
- ➕ **New**: active trip quick-return link.

### Active trip link

When `user` is logged in, the header fetches the most recently updated trip from the `trips` table (single row, `order by updated_at desc limit 1`). If a trip exists, render its name to the left of the avatar as a small muted link to `/my-trips/:slug`, truncated to about 18 characters with an ellipsis. Hidden on mobile, the mobile sheet already has a My Trips entry.

Implementation notes:
- Tiny `useActiveTrip()` hook in `src/hooks/useActiveTrip.ts` that queries once when the user changes and exposes `{ slug, name }`.
- Cached client-side so it doesn't refetch on every route change.

## Files touched

- `src/lib/searchIntent.ts` — add `classifyToolIntent`.
- `src/pages/Index.tsx` — update `handleHeroSearch` to consult the new classifier.
- `src/pages/Gear.tsx`, `Safety.tsx`, `BestTime.tsx`, `Currency.tsx`, `Flights.tsx`, `Itinerary.tsx`, `TravelIntel.tsx` — read `?q=` and auto-run.
- `src/components/Footer.tsx` — remove `NewsletterCTASection`.
- `src/hooks/useActiveTrip.ts` — new.
- `src/components/Header.tsx` — render active-trip link beside avatar.

## Out of scope (call out)

- No new `/visa` page. Visa-style queries route to `/safety` since safety already covers entry/advisory content. Say the word and I'll spin up a dedicated visa page next.
- No tool-page UI redesign, just URL prefill and auto-run.
- No changes to admin Dashboard link visibility.
