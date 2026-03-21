

# SEO Tweaks: Save System UX Upgrade + Schema Enhancements

## What Already Exists
- Save/compare system with `useSavedReviews` hook (localStorage + DB sync)
- `/compare` page with verdict generation
- `/my-trips` page (authenticated users)
- `ComparisonFloatingBadge` floating button
- `SaveReviewButton` component (Bookmark icon)
- Date stamps + source scores on hotel cards
- FAQ accordion blocks on hotel cards
- JSON-LD AggregateRating + FAQPage schema on review pages
- WebApplication schema on homepage

## What's New from This Prompt

### 1. Heart Icon Instead of Bookmark
- `SaveReviewButton.tsx`: Swap `Bookmark`/`BookmarkCheck` to `Heart` with filled state
- `ComparisonFloatingBadge.tsx`: Swap `BarChart3` to `Heart`

### 2. Add `/my-saves` Route (Alias to Compare)
- `App.tsx`: Add `/my-saves` route pointing to `Compare` component
- Update toast messages in `SaveReviewButton` to reference `/my-saves`
- Update `ComparisonFloatingBadge` link to `/my-saves`

### 3. Social Proof "X Travelers Saved" Badge on Hotel Cards
- `HotelResultCard.tsx`: Add a simulated "X travelers saved this" line using a deterministic count derived from the hotel name (hash-based, 200-3000 range)
- Gold badge styling for counts > 500

### 4. Save Count on Homepage Question Cards
- `TravelersAskSection.tsx`: Add small save count text under each card (simulated, e.g., "1,247 saved")

### 5. ItemList Schema on Compare/Saves Page
- `Compare.tsx`: Add `ItemList` JSON-LD schema listing saved hotels as `ListItem` entries with `Hotel` type

### 6. "Start Your Saves List" CTA on Homepage
- `Index.tsx`: Add a small CTA banner below `RecentReviewsHomepage` linking to `/my-saves`

### 7. Fix Remaining "Honest" in SEO Description
- `AIReview.tsx` line 123: Change `Honest aggregated review` to `Aggregated review`
- `AIReview.tsx` line 100: Update fallback document title

### 8. Review Page H1 Update
- The prompt says H1 should be "Atlantis The Royal: Reviews March 2026". The current `AIReviewResult` component likely has the H1. Need to verify and add "Reviews March 2026" suffix to H1 on review pages.

## Files

| File | Action |
|------|--------|
| `src/components/SaveReviewButton.tsx` | Heart icon, update toast to reference /my-saves |
| `src/components/ComparisonFloatingBadge.tsx` | Heart icon, link to /my-saves |
| `src/App.tsx` | Add /my-saves route |
| `src/components/reviews/HotelResultCard.tsx` | Add "X travelers saved" badge |
| `src/components/TravelersAskSection.tsx` | Add save counts to cards |
| `src/pages/Compare.tsx` | Add ItemList JSON-LD schema |
| `src/pages/AIReview.tsx` | Fix "Honest" in description, update fallback title |
| `src/pages/Index.tsx` | Add "Start your saves" CTA section |

## Build Order
1. Heart icon swap (SaveReviewButton + FloatingBadge)
2. /my-saves route + link updates
3. Social proof badges on hotel cards
4. Save counts on homepage cards
5. ItemList schema on compare page
6. "Honest" cleanup + title fixes
7. Homepage saves CTA

