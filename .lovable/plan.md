

# Fix Broken Affiliate Links

## Root Cause

The `buildDeepLinks()` function in `AffiliateLinks.tsx` appends query parameters using `&` directly to the base affiliate URLs. However, these base URLs contain no existing query string (no `?`), so the resulting URLs are malformed and return 404 errors.

**Current (broken):**
```
https://expedia.com/affiliates/expedia-home.2FNlhXx&destination=Hotel%20Sonya
```

**Fixed:**
```
https://expedia.com/affiliates/expedia-home.2FNlhXx?destination=Hotel%20Sonya
```

Same issue affects Hotels.com links (`&q-destination=` should be `?q-destination=`).

## Fix

**File: `src/components/AffiliateLinks.tsx`** (lines 54-56 in `buildDeepLinks`)

Change `&` to `?` for both Expedia and Hotels.com deep links:

```typescript
expedia: EXPEDIA_LINKS[country] + `?destination=${q}`,
hotels: HOTELS_LINKS[country] + `?q-destination=${q}`,
```

This is a one-line-each fix in the `buildDeepLinks` function. No other files need changes -- every component that uses affiliate links (AIReviewResult, DestinationReview, ThingsToDoSection, RecentReviewsHomepage, MyReviews, MyTrips, etc.) all go through this same function, so fixing it here fixes them everywhere.
