

# Review-First Flow for All Homepage Sections

## Summary
Flip the CTA hierarchy across all three homepage sections so the primary action is always "Read/Generate Review" and the booking/purchase link becomes secondary small text. Also add product image fetching for gear results.

## Changes

### 1. Real Destination Reviews Cards
**File: `src/components/RecentReviewsHomepage.tsx`**
- Make the full-width button "Read Review" (links to `/review/:slug`) — styled as the primary CTA with `bg-secondary`
- Below it, add small text link: "Book on Expedia →" with `ExternalLink` icon — subtle `text-xs text-muted-foreground hover:text-primary`
- Remove the current big "Book on Expedia" button

### 2. Featured Deals Cards
**File: `src/components/TravelDealsSection.tsx`**
- Change each card from being an `<a>` wrapping the whole card to a `<div>`
- Replace "Grab This Deal →" button with "Review It →" that navigates to `/review/:slug` (generates a review via the existing `generate-review` edge function by slugifying the deal name)
- Add small text link below: "Grab This Deal →" pointing to the deal's `affiliateUrl`
- Keep discount badges, countdown, pricing display unchanged

### 3. Travel Gear Featured Cards
**File: `src/components/GearPreviewSection.tsx`**
- Change each card from wrapping in an `<a>` to a `<div>`
- Add "Review It" button that triggers `gear.fetchProductReview(card.title)` (uses existing gear review flow)
- Add small "Shop on Amazon →" text link below pointing to `card.affiliateUrl`

### 4. Gear Product Image Fetching
**File: `supabase/functions/travel-gear-intel/index.ts`**
- In the Perplexity prompt for both "must-haves" and "review" types, add instruction: "For each product, include an `imageUrl` field with a direct URL to a product image found online"
- The `imageUrl` field already exists in the `GearItem` and `GearReviewData` interfaces
- Update `PackingResultCard` in `src/components/gear/GearResults.tsx` to display the `imageUrl` if present (replacing the category icon placeholder with the actual product photo)

### 5. Gear Review Amazon Link
**File: `src/components/gear/GearResults.tsx`**
- In `ProductReviewPanel`, move the Amazon buy link to the bottom of the review panel (after pros/cons/verdict) as a clear CTA: "Buy on Amazon →"
- Keep it as the only affiliate touchpoint in the review

## Files

| File | Action |
|------|--------|
| `src/components/RecentReviewsHomepage.tsx` | Swap button hierarchy: big = Read Review, small = Book link |
| `src/components/TravelDealsSection.tsx` | Unwrap `<a>`, add Review It button + small deal link |
| `src/components/GearPreviewSection.tsx` | Unwrap `<a>`, add Review It button + small shop link |
| `supabase/functions/travel-gear-intel/index.ts` | Add imageUrl instruction to Perplexity prompts |
| `src/components/gear/GearResults.tsx` | Show product images on cards, move Amazon link to review bottom |

## Order
1. RecentReviewsHomepage — swap button hierarchy
2. TravelDealsSection — review-first flow
3. GearPreviewSection — review-first flow
4. travel-gear-intel edge function — add image URL fetching
5. GearResults — display product images + reposition Amazon link

