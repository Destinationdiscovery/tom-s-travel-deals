

# Replace Expedia CTA with Homepage CTA on Blog Articles

## What Changes
The `InlineAffiliateCTA variant="banner"` on CompassArticle pages currently links to Expedia. Replace it with a CTA that says "Planning a trip?" and directs readers to the ReviewThenGo homepage to explore the planning tools.

**Important**: Only change the blog article usage. The Expedia CTA on `AIReviewResult` and `DestinationReview` pages stays as-is (those are review pages where Expedia links make sense).

## Implementation

### `src/pages/CompassArticle.tsx`
- Remove the `InlineAffiliateCTA` import and usage (line 260)
- Replace with an inline card:
  - Heading: **"Planning a trip?"**
  - Subtext: "Check out the 8 planning tools on our main page — reviews, flights, gear, and more."
  - Button: `Link to="/"` with text "Explore Our Tools" and an arrow icon
  - Same rounded-2xl card styling as the current banner for visual consistency

Single file change. No other files affected — the `InlineAffiliateCTA` component stays intact for review pages.

| File | Change |
|------|--------|
| `src/pages/CompassArticle.tsx` | Replace Expedia banner with homepage CTA card |

