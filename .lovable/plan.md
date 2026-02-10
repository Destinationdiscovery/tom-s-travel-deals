

## Travel Gear Redesign: Single Search Flow with On-Demand Product Reviews

Remove all tabs. Replace with a single, powerful search experience that mirrors the site's review-first identity.

---

### The Flow

1. User lands on `/gear` and sees a hero with a prominent search bar
2. User types their trip (e.g., "7 day all inclusive in Mexico")
3. AI returns product recommendation cards -- each with an image, name, brand, price, category, reason, "Get it on Amazon" link, and a **"Review This"** button
4. User clicks "Review This" on any product
5. A full AI-generated product review appears inline (same style as destination reviews): RTG Score, category ratings, summary, synthesized buyer feedback, pros/cons, "Best For" tags, and "Get it on Amazon" CTA
6. User can go back to their results and review another product

---

### What Gets Removed

- All three tabs (My Reviews, Trending, Must-Haves)
- Static gear review cards and category filters
- `/gear/:slug` route and `GearReview.tsx` page
- Import of `gearReviews` data in `Gear.tsx`

### What Stays

- `GearReviewsSection.tsx` on the homepage (links to `/gear` -- can update later)
- `gearReviews` data file (still used by homepage carousel)
- All Amazon affiliate logic with regional tags
- Hero section (updated copy)

---

### Technical Implementation

**1. Update the edge function (`supabase/functions/travel-gear-intel/index.ts`)**

Add a third type: `"review"`. When type is `"review"`, the Perplexity prompt asks for a full product review:
- Product name, brand, price range
- Overall rating (1-5)
- Category ratings: Durability, Value, Portability, Comfort, Design (each 1-5)
- Summary (2-3 sentences)
- 3-4 review paragraphs synthesized from Amazon reviews and expert sources
- Pros list (4-6 items)
- Cons list (3-4 items)
- "Best For" tags (3-5)
- Citations

Also update the "must-haves" prompt to request an `imageSearch` term per item (a short phrase Perplexity can use to describe the product for image display -- we'll use category-based placeholder icons as a reliable fallback since external image URLs are unreliable).

Cache key: `review:{product-name-slug}`

**2. Update the hook (`src/hooks/useGearIntel.ts`)**

- Add `"review"` to `GearIntelType`
- Add a new `GearReviewData` interface:
```text
GearReviewData {
  productName: string
  brand: string
  priceRange: string
  overallRating: number
  ratings: { Durability: number, Value: number, Portability: number, Comfort: number, Design: number }
  summary: string
  reviewParagraphs: string[]
  pros: string[]
  cons: string[]
  bestFor: string[]
  citations: string[]
  amazonUrl: string
}
```
- Add `reviewData` state and `reviewLoading` state
- Add `fetchProductReview(productName: string)` function

**3. Rewrite the Gear page (`src/pages/Gear.tsx`)**

Single-flow layout (no tabs):

- **Hero**: Updated title "Travel Gear" with subtitle "Tell us where you're going -- we'll tell you what to pack"
- **Search bar**: Single input + button, placeholder "e.g. 7 day all inclusive in Mexico, backpacking Japan..."
- **Results grid**: 2-column card grid, each card shows:
  - Category icon/badge (color-coded by category like Packing, Tech, Comfort, Safety)
  - Product name + brand
  - Price range
  - Why it's recommended (1-2 sentences)
  - Two action buttons: "Get it on Amazon" (affiliate link) + "Review This" (triggers AI review)
- **Product review section**: When user clicks "Review This", a full review panel appears below the results (or replaces them with a back button), styled identically to `AIReviewResult.tsx`:
  - Product name as header
  - RTG Score with stars + "Compiled from Real Product Reviews" badge
  - Rating breakdown bars (Durability, Value, Portability, Comfort, Design)
  - Summary paragraph
  - "What Buyers Say" sections
  - Pros and Cons
  - "Best For" tags
  - "Get it on Amazon" CTA card with affiliate link
  - Sources/citations
  - "Back to Results" button
- **Loading states**: Reuse the staged progress loader pattern
- **Affiliate disclaimer** at bottom

**4. Update `App.tsx`**

- Remove the `/gear/:slug` route
- Remove `GearReview` import

**5. Update `GearReviewsSection.tsx` (homepage)**

- Update description text to match new functionality: "Tell us where you're going and we'll recommend the best gear -- with full AI reviews on demand."
- Keep the carousel but update card links to navigate to `/gear` with a search query param instead of `/gear/:slug`

---

### Files Changed

| Action | File |
|--------|------|
| Modify | `supabase/functions/travel-gear-intel/index.ts` -- add "review" type prompt |
| Modify | `src/hooks/useGearIntel.ts` -- add review type, GearReviewData interface |
| Rewrite | `src/pages/Gear.tsx` -- single search flow with inline product reviews |
| Modify | `src/App.tsx` -- remove `/gear/:slug` route |
| Modify | `src/components/GearReviewsSection.tsx` -- update description and card links |
| Delete | `src/pages/GearReview.tsx` -- no longer needed |

---

### Open Question: Page Title

The search prompt needs a catchy name. Some options to consider:
- "Where Are You Going?"
- "What Should I Pack?"
- "Pack Smart"

We can finalize this during implementation or you can pick one now.

