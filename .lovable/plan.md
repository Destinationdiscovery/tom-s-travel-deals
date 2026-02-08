

## Fix: Affiliate Links Should Open Blank (No Pre-Populated Destination)

### The Problem

When clicking the Expedia or VRBO booking button after reviewing a Niagara Falls hotel, Expedia landed on "Batumi, Adjara, Georgia" — a completely unrelated destination. The property name is being passed as a search destination, but Expedia's search engine interprets it unpredictably.

### The Fix

Remove the destination pre-population from both affiliate links entirely. The buttons will send users to a clean Expedia Hotels page and VRBO homepage so they can search on their own terms. This prevents any wrong destination from ever appearing.

### File Change

**`src/components/AffiliateLinks.tsx`**

Update the two `buildUrl` functions to link to clean pages without any destination parameter:

| Affiliate | Current Link Target | New Link Target |
|-----------|-------------------|-----------------|
| **Expedia** | `expedia.ca/Hotel-Search?destination=<propertyName>` | `expedia.ca/Hotels` (clean hotel search page) |
| **VRBO** | `vrbo.com/search?destination=<propertyName>` | `vrbo.com` (clean homepage) |

Both links will still go through the CJ Affiliate tracking URLs (the `anrdoezrs.net` and `jdoqocy.com` click trackers with PID and AID) so commission tracking is preserved. The only change is removing the `destination=` query parameter from the nested URLs.

The `propertyName` prop can also be removed from the component since it's no longer used, along with the corresponding prop in `AIReviewResult.tsx` where it's passed in.

