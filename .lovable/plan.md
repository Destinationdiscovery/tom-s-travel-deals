

# Remove Booking CTAs and Promo Slideshow

## Changes

### 1. `src/components/AIReviewResult.tsx`
Remove three duplicate booking/affiliate elements from the review layout:
- **Compare Prices row** (line 140-141) - the inline "Compare prices: Expedia | Hotels.com | VRBO" bar after the summary card
- **Plan Your Trip CTA** (lines 200-203) - the bordered card with Compass icon after travel tips
- **ComparePricesRow and PlanYourTripCTA function definitions** (lines 326-399) - the now-unused sub-components

The sidebar `AffiliateLinks` ("Ready to Book?") and mobile `AffiliateLinks` will remain since those are the booking buttons you want to keep.

### 2. `src/pages/Index.tsx`
Remove the promo slideshow entirely:
- Remove the `PromoSlideshow` import (line 9)
- Remove `showPromo` state (line 26)
- Remove `handlePromoComplete` function (lines 94-97)
- Remove the `{showPromo && <PromoSlideshow .../>}` render (line 106)

The `/promo` route page will remain untouched for future use if needed.

