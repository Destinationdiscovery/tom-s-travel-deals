## What this fixes

Four targeted changes addressing the real gaps from Gemini's audit. Skipping items that were either wrong or already done.

---

### 1. Remove `noindex` from AI review pages (highest impact)

`src/pages/AIReview.tsx` currently passes `noindex` to `SEOHead`. That's telling Google and AI bots not to index any `/review/:slug` page, which silently nukes the entire AI-review surface area from search results. This is almost certainly the biggest single reason the audit perceived "thin/missing pages."

**Change:** Remove the `noindex` prop. Cached reviews are real, unique, content-rich pages and should be indexed. Keep `noindex` only for the auto-generation fallback path (when a slug isn't in `cached_reviews` yet) so we don't index half-built pages.

Implementation: only render `<SEOHead>` once the review has been confirmed loaded from cache (not generated), or pass `noindex` conditionally based on whether the review came from cache vs. live generation.

---

### 2. Meta descriptions on tool pages

Audit was right that some tool pages may be missing descriptions. Audit each of these and ensure `<SEOHead>` has a real, unique `description` (~150 chars):

- `/safety` (Safety.tsx)
- `/gear` (Gear.tsx)
- `/itinerary` (Itinerary.tsx)
- `/flights` (Flights.tsx)
- `/currency` (Currency.tsx)
- `/best-time` (BestTime.tsx)
- `/compare` (Compare.tsx)
- `/destinations` (Destinations.tsx)
- `/guides` (Guides.tsx)

For each missing or generic one, write a tool-specific 140 to 160 char description naming the tool, what it answers, and the brand.

---

### 3. "More like this" related reviews module

Add a `RelatedReviews` component that renders 4 to 6 cards at the bottom of every review page (`AIReview.tsx` and `DestinationReview.tsx`).

**Selection logic** (cheap, no new tables):
- Query `cached_reviews` for entries sharing the same `location` (or first word of location) excluding current slug.
- Fall back to most recently created reviews if fewer than 4 matches.
- Limit 6, render as compact cards linking to `/review/:slug`.

This satisfies both the "internal linking web" recommendation and gives bots real anchor text between properties.

---

### 4. AuthorBio coverage check

Already on `/about` and `/compass/:slug`. **Add to:**
- `AIReview.tsx` (above Footer)
- `DestinationReview.tsx` (above Footer, after the related section)

This adds the E-E-A-T signal Gemini called out, on the pages that matter most for travel queries.

---

## Out of scope / explicitly skipping

- Changing the homepage `<title>` ("ReviewThenGo" alone) — audit was wrong; current title is descriptive.
- Re-adding generic "review schema" — already present via `aggregateRating` in `SEOHead`.
- Server-side rendering / prerendering — not available on Lovable Cloud hosting and the static shell in `index.html` already covers the non-JS-bot case.

---

## Files touched

- `src/pages/AIReview.tsx` — remove/conditional `noindex`, add `<AuthorBio />` and `<RelatedReviews />`.
- `src/pages/DestinationReview.tsx` — add `<AuthorBio />` and `<RelatedReviews />`.
- `src/components/RelatedReviews.tsx` — new component.
- `src/pages/{Safety,Gear,Itinerary,Flights,Currency,BestTime,Compare,Destinations,Guides}.tsx` — verify/add unique meta descriptions.

No DB or edge-function changes. No design or layout overhaul.

---

## Verification (after implementation)

I'll re-curl with `User-Agent: GPTBot` and `PerplexityBot` against:
- `https://www.reviewthengo.com/review/<a-real-slug>` — confirm no `noindex`, AuthorBio HTML present, related links present.
- 2 to 3 tool pages — confirm `<meta name="description">` is unique and populated.

Then report back with the curl evidence rather than just "done."
