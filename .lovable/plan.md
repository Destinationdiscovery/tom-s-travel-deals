

# Dynamic Reviews Pages — `/reviews/[query]` Flow

## What We're Building
A new dynamic page at `/reviews/:query` that loads when users click question cards. Instead of leaving the site or going to `/search`, users stay on-site and see a rich, SEO-optimized results page with 5 hotel cards, affiliate sidebar, and sticky search — all generated via the existing `travel-search` edge function.

## Architecture

```text
User clicks "Best hotels Paris" card
  → navigates to /reviews/best-hotels-paris
  → ReviewsPage extracts query from URL slug
  → Calls travel-search edge function
  → Renders 5 hotel cards + affiliate sidebar + sticky search
  → Each card has "Review It" → generates full review at /review/:slug
```

## Changes

### 1. New Page: `src/pages/Reviews.tsx`
The core new page. Structure:
- **Sticky search bar** at top (always visible, lets user search another query)
- **H1**: "Best Hotels Paris: Real Reviews 2026" (derived from slug)
- **5 hotel result cards** in main column (left), each with:
  - Hotel name + location
  - Star rating + category breakdown (Rooms, Service, Value, Location)
  - Top Pros (green checkmarks) / Top Cons (red X)
  - "Worth Booking If" line (from bestFor tags)
  - Sources note
  - "Review It" button → calls generate-review → navigates to `/review/:slug`
- **Right sidebar** (desktop) / bottom section (mobile):
  - "Ready to Book?" affiliate card (Expedia, Hotels.com, VRBO links using existing `buildDeepLinks`)
  - "Compare Rates" table if multiple results
  - Travel gear link to `/gear`
- **Things to Do** section (if activities returned from search)
- **Email capture**: "Get [destination] hotel alerts" inline form
- **Bottom sticky search**: "Try another destination?"
- **Footer affiliate disclosure**

### 2. New Component: `src/components/reviews/HotelResultCard.tsx`
Reusable card matching the spec:
- Photo placeholder (gradient with hotel icon — no real photos from search)
- H2 hotel name + location
- Overall rating + category scores row
- Pros/Cons lists
- "Worth Booking If" line
- Sources line
- "Review It" CTA button

### 3. New Component: `src/components/reviews/BookingSidebar.tsx`
Right sidebar with affiliate links:
- Uses existing `buildDeepLinks` + `detectCountry` from AffiliateLinks
- Expedia, Hotels.com, VRBO deep links with property name
- Affiliate disclosure text
- Sticky on desktop (`sticky top-20`)

### 4. New Component: `src/components/reviews/StickySearchBar.tsx`
Compact sticky search bar:
- Fixed at top below header
- Input + search button
- On submit → navigates to `/reviews/[new-kebab-query]`

### 5. Update: `src/components/TravelersAskSection.tsx`
- Change click handler from `/search?q=...` to `/reviews/[kebab-slug]`
- Expand to 10 question cards (add: Adults-only Punta Cana, Beach resorts Cancun, Boutique hotels Paris, Family resorts Jamaica)
- Add rotation/randomization showing 6 of 10

### 6. Route: `src/App.tsx`
- Add lazy import for Reviews page
- Add `<Route path="/reviews/:query" element={<Reviews />} />`

### 7. Update: `src/pages/TravelSearch.tsx`
- Keep as-is (it's the broader search page)
- No changes needed — `/reviews` is the new card-click destination

## Affiliate Rules (Enforced)
- Affiliate links appear ONLY in:
  1. BookingSidebar (right side / mobile footer)
  2. Compare table at bottom
  3. Gear footer link to `/gear`
- Zero affiliate links inside hotel review cards or content sections

## SEO
- Meta title: "[Query] Real Reviews 2026 | ReviewThenGo"
- Meta desc: "Honest ratings from Google, TripAdvisor + more. Top 5 [destination] properties ranked."
- AggregateRating schema on each hotel card
- FAQPage schema with auto-generated Q&As
- BreadcrumbList: Home > Reviews > [Query]
- Clean `/reviews/best-hotels-paris` URLs

## Files

| File | Action |
|------|--------|
| `src/pages/Reviews.tsx` | **New** — dynamic results page |
| `src/components/reviews/HotelResultCard.tsx` | **New** — hotel card component |
| `src/components/reviews/BookingSidebar.tsx` | **New** — affiliate sidebar |
| `src/components/reviews/StickySearchBar.tsx` | **New** — sticky search bar |
| `src/components/TravelersAskSection.tsx` | **Update** — link to /reviews/, expand to 10 cards |
| `src/App.tsx` | **Update** — add /reviews/:query route |

## Order
1. Create StickySearchBar component
2. Create HotelResultCard component
3. Create BookingSidebar component
4. Create Reviews page (assembles all above)
5. Add route to App.tsx
6. Update TravelersAskSection to link to /reviews/

