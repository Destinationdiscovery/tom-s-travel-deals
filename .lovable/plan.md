

## Move the Location Map Next to the Booking Links

### The Problem

The Location Map card is currently in the right sidebar alongside the Rating Breakdown and Best For cards. Even though sticky was removed, the sidebar layout still causes scrolling issues with the map moving independently.

### The Fix

Move the Location Map out of the sidebar and into the main content column, placing it right next to (below) the Affiliate/Booking links. This keeps everything the user scrolls through in a single column flow.

### File Change

**`src/components/AIReviewResult.tsx`**

1. **Remove** the Location Map block (lines 226-247) from the sidebar `<div>` on the right
2. **Insert** that same Location Map block into the main content column (left side), directly after the `<AffiliateLinks>` component (after line 174) and before the "New Review" button

The sidebar will then only contain the Rating Breakdown and Best For cards -- no more scrolling map issue. The map will sit naturally in the main content flow right beside the booking buttons.

| Section | Before | After |
|---------|--------|-------|
| Main content (left) | Tips → Affiliate Links → New Review button | Tips → Affiliate Links → **Location Map** → New Review button |
| Sidebar (right) | Rating Breakdown + Best For + Location Map | Rating Breakdown + Best For only |

