

# Plan: Custom Affiliate Links for Featured Reviews

## Problem
When a user clicks a featured review card and opens the full review, they see generic affiliate links (Expedia/Hotels.com/VRBO sidebar + "Planning a trip?" banner). The admin-curated affiliate URL from the card should carry through instead.

## Approach

### 1. `AIReview.tsx` — Look up affiliate URL from `featured_reviews`
After fetching the cached review, also query `featured_reviews` by slug. If a match exists with an `affiliate_url`, pass it down to `AIReviewResult`.

### 2. `AIReviewResult.tsx` — Accept optional `affiliateUrl` prop
When `affiliateUrl` is provided (featured review):
- **Remove** the `AffiliateLinks` sidebar card ("Ready to Book?" with Expedia/Hotels.com/VRBO)
- **Replace** the `InlineAffiliateCTA` banner ("Planning a trip?") with a "Book This Trip on Expedia" button using the exact affiliate URL
- Keep ratings, map, save button, everything else the same

When `affiliateUrl` is NOT provided (regular user-generated review):
- Everything stays exactly as it is today

### 3. Changes summary

**`src/pages/AIReview.tsx`** (~5 lines):
- After fetching cached_review, query `featured_reviews` for matching slug
- Store `affiliateUrl` in state
- Pass `affiliateUrl` prop to `AIReviewResult`

**`src/components/AIReviewResult.tsx`** (~20 lines):
- Add optional `affiliateUrl?: string` to props
- When set: hide `AffiliateLinks` component (sidebar + mobile), replace `InlineAffiliateCTA` banner with a custom CTA block using the affiliate URL
- CTA text: "Book This Trip on Expedia" with ExternalLink icon, styled like the card button

The affiliate link will appear in exactly 2 places for featured reviews:
1. On the homepage card ("Book on Expedia — Save Now")
2. Inside the full review at the end (replacing the generic "Planning a trip?" banner)

