

# Move Trip Details Card to the Right Column (Under the Map)

## What Changes

Instead of the TripDetailsCard sitting at the bottom of the quote as a full-width section, it will be placed inside the review section's right-side column -- directly below the Location map. This creates a single cohesive layout where the left side has the review content and the right side has Ratings, Map, and Booking Details stacked together.

On mobile (where the layout is single-column), the card will appear after the review content, maintaining readability.

## Changes Required

### 1. Update `QuoteReviewSection` to accept and render trip details

Pass trip detail props into `QuoteReviewSection` so it can render `TripDetailsCard` in the right column (desktop) and at the bottom (mobile).

New optional props added to `QuoteReviewSectionProps`:
- `tripDetailsProps` -- an object containing all `TripDetailsCardProps` fields

When `tripDetailsProps` is provided, render `<TripDetailsCard>` after `<LocationMap>` in both the desktop right column and the mobile layout.

### 2. Update `QuotePreview.tsx`

Remove the standalone `<TripDetailsCard>` below the review section. Instead, pass trip details as a prop to `<QuoteReviewSection>`:

```
<QuoteReviewSection
  reviewData={quote.reviewData}
  hideHeader
  tripDetailsProps={{
    resortName: quote.resortName,
    destination: quote.destination,
    ...all other fields...
  }}
/>
```

When `includeReview` is false (no review attached), the `TripDetailsCard` remains as a standalone full-width card below the header (current position as fallback).

### 3. Update `PublicQuote.tsx`

Same pattern: pass `tripDetailsProps` into `<QuoteReviewSection>` and remove the standalone `<TripDetailsCard>`. Include the same fallback for quotes without a review.

### What stays the same

- The TripDetailsCard component itself is unchanged
- The review layout (left column content, ratings, map) is unchanged
- The "Valid Until" footer and agent contact info stay at the bottom
- All action buttons remain unchanged
- Mobile layout continues to stack everything vertically
