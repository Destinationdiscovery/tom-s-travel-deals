

## Two Changes: New Hero Image + "New Review" Button

### 1. Replace Hero Background Image

The uploaded overwater villa sunset photo will replace the current `hero-beach.jpg` as the hero background.

- Copy `user-uploads://two-bedroom-ocean-residence_1.jpg` to `src/assets/hero-beach.jpg` (overwrite the existing file so no other imports need to change)
- The alt text on the image tag in `HeroSection.tsx` will be updated to match the new image (e.g., "Overwater villa at sunset")

### 2. Add "New Review" Button Below Affiliate Links

After a review is generated, a "New Review" button will appear at the bottom of the review (right below the Expedia/VRBO booking links). Clicking it will:

- Scroll the page back to the top (to the hero/search bar)
- Clear the current review and reset the search bar to empty

**Implementation approach:**

- **Index.tsx**: Pass the `clearReview` function (already available from `useGenerateReview`) down to `AIReviewResult`
- **AIReviewResult.tsx**: Accept an `onNewReview` callback prop. Add a styled button below the `AffiliateLinks` component that, when clicked, calls `onNewReview()` and scrolls to the top of the page
- The button will use a search icon and say something like "Search Another Property" to clearly communicate what it does

### Files to Change

| File | Change |
|------|--------|
| `src/assets/hero-beach.jpg` | Overwritten with the new uploaded image |
| `src/components/HeroSection.tsx` | Update image alt text |
| `src/pages/Index.tsx` | Pass `clearReview` to `AIReviewResult` as `onNewReview` |
| `src/components/AIReviewResult.tsx` | Add `onNewReview` prop, render a "Search Another Property" button below the affiliate links section |

