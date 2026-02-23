

# Remove Top "Planning a Trip?" Banner from Reviews

## What Changes

Remove the "Planning a trip? / Search on Expedia" banner that appears inside the summary card at the top of every AI review. The other affiliate CTAs on the page (after tips, in the sidebar, on activity cards, etc.) stay untouched.

## Technical Detail

**File: `src/components/AIReviewResult.tsx`** (lines 139-141)

Delete the `<div className="mt-4">` wrapper containing the first `<InlineAffiliateCTA>` that sits directly below the summary paragraph inside the summary card. The second `InlineAffiliateCTA` (after Travel Tips, around line 203) and the sidebar `AffiliateLinks` component remain.

