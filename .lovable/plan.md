

## Deep-Link Affiliate URLs + Full Monetization Bundle

Four features: deep-linked affiliate URLs, a "Compare Prices" row, an email capture component, and auto-generated SEO listicle pages.

---

### 1. Deep-Link Affiliate URLs (Property-Specific Search)

Instead of sending users to generic homepages, pre-populate the search with the property name so they land on relevant results.

**How it works per platform:**

- **Expedia**: Redirect to `expedia.com/Hotel-Search?destination=PROPERTY+NAME` through the existing affiliate tracking link
- **Hotels.com**: Redirect to `hotels.com/search.do?q-destination=PROPERTY+NAME` through the existing affiliate tracking link  
- **VRBO**: Already uses CJ deep link format -- change the encoded URL from `vrbo.com` to `vrbo.com/search?query=PROPERTY+NAME`

**Files changed:**

| File | Change |
|------|--------|
| `src/components/AffiliateLinks.tsx` | Accept optional `propertyName` prop. When provided, build deep-linked search URLs instead of homepage links. Export a helper `buildDeepLinks(country, propertyName?)` for reuse. |
| `src/components/AIReviewResult.tsx` | Pass `data.propertyName` to `AffiliateLinks` and `PlanYourTripCTA` components |
| `src/components/review/ThingsToDoSection.tsx` | Pass activity name to the "Explore more" link so it searches for the activity, not the property |

The fallback behavior stays the same: if no `propertyName` is provided (e.g., on non-review pages), links go to the homepage as they do today.

---

### 2. "Compare Prices" Row After Summary Card

A horizontal strip below the summary card showing all three platforms with "Check rates" links. This is the highest-visibility placement on the page.

**File:** `src/components/AIReviewResult.tsx`

- New sub-component `ComparePricesRow` inserted after the Summary Card (order 1.5)
- Shows three inline items: Expedia | Hotels.com | VRBO, each with a "Check rates" text link
- Uses the deep-linked URLs from change 1
- Styled as a subtle horizontal bar, not a banner

---

### 3. Email Capture Component

A lead magnet below the review to build a mailing list for future affiliate campaigns.

**New file:** `src/components/review/EmailCapture.tsx`

- Heading: "Get this review as a PDF + exclusive deals"
- Simple email input + submit button
- Stores subscriber email in a new `subscribers` database table
- Placed after the "Plan Your Trip" CTA (order 6.75)

**Database:** New `subscribers` table with columns: `id`, `email` (unique), `source_slug` (which review they signed up from), `created_at`. No RLS needed since this is a public-facing insert-only form (we'll use an edge function to prevent abuse).

**New edge function:** `supabase/functions/subscribe/index.ts` -- validates email format, inserts into `subscribers` table, returns success/error. Rate-limited by IP.

---

### 4. Auto-Generated SEO Listicle Pages

Use cached review data to generate "Top Resorts in [Location]" pages that rank in search engines and drive organic traffic.

**New file:** `src/pages/TopDestinations.tsx`

- Route: `/top/:location` (e.g., `/top/mexico`, `/top/cancun`)
- Queries `cached_reviews` table filtered by location
- Renders a listicle: "Top Resorts in Mexico" with mini-cards for each cached review
- Each card links to the full review page
- Affiliate links woven into the page (sidebar + inline CTAs)

**New file:** `src/components/TopDestinationCard.tsx`

- Mini review card showing: property name, rating, one-line summary, "Read full review" link
- "Check rates" affiliate link on each card

**File:** `src/App.tsx` -- Add route for `/top/:location`

---

### Technical Summary

| File | Change |
|------|--------|
| `src/components/AffiliateLinks.tsx` | Accept `propertyName` prop, build deep-linked search URLs, export `buildDeepLinks` helper |
| `src/components/AIReviewResult.tsx` | Pass `propertyName` to affiliate components, add `ComparePricesRow` after summary, add `EmailCapture` after Plan Your Trip CTA |
| `src/components/review/ThingsToDoSection.tsx` | Use deep-linked URL for "Explore more" link |
| `src/components/review/EmailCapture.tsx` | **New** -- email capture form component |
| `supabase/functions/subscribe/index.ts` | **New** -- edge function for email subscription |
| `src/pages/TopDestinations.tsx` | **New** -- auto-generated listicle page |
| `src/components/TopDestinationCard.tsx` | **New** -- mini review card for listicle |
| `src/App.tsx` | Add `/top/:location` route |

**Database migration:** Create `subscribers` table.

No new frontend dependencies required.

