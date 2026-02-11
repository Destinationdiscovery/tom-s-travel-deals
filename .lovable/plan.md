
## Amazon Creators API Integration for Gear Product Images

Replace the broken Perplexity image URLs with official Amazon product images using the Amazon Creators API. This also gives us real Amazon detail page links with your affiliate tag embedded, replacing the generic search URLs.

### How It Works

1. Perplexity returns a list of specific product names (e.g., "Osprey Farpoint 40 Travel Backpack")
2. After getting the Perplexity results, the edge function calls the Amazon Creators API `SearchItems` for each product name
3. The API returns official product images hosted on `m.media-amazon.com` (no hotlink issues) and direct detail page URLs with your affiliate tag
4. The enriched data (image + detail URL) is cached alongside the Perplexity results

### Authentication Flow

The Creators API uses OAuth 2.0 client credentials:
- Your Credential ID and Secret are sent to Amazon Cognito to get an access token (valid 1 hour)
- The token is cached in-memory and refreshed when expired
- All calls go to `https://creatorsapi.amazon/catalog/v1/searchItems`

### Files to Change

**Store Secrets**
- `AMAZON_CREATORS_CLIENT_ID` -- your Credential ID
- `AMAZON_CREATORS_CLIENT_SECRET` -- your Credential Secret

**Edit: `supabase/functions/travel-gear-intel/index.ts`**
- Add an `enrichWithAmazonImages()` function that:
  1. Gets an OAuth token from `creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token` using client credentials grant
  2. For each product item, calls `SearchItems` with `keywords: item.name`, `partnerTag`, `marketplace`, requesting `images.primary.large` and `itemInfo.title`
  3. Takes the first result's primary image URL and `detailPageURL` (which already includes the affiliate tag)
  4. Falls back gracefully if any individual product lookup fails (keeps the item, just without an image)
- After Perplexity returns results, call `enrichWithAmazonImages()` on the items before caching
- For "review" type, also enrich the single product with an Amazon image
- Token is cached in a module-level variable with expiry check so it's reused across requests within the same function instance
- The marketplace header (`x-marketplace`) and token endpoint are selected based on user country (CA -> www.amazon.ca, US -> www.amazon.com, GB -> www.amazon.co.uk)

**Edit: `src/pages/Gear.tsx`**
- Remove the `gear-image-proxy` proxy URL helper since Amazon's `m.media-amazon.com` images don't need proxying
- Use `item.imageUrl` directly (now pointing to official Amazon CDN)
- Use `item.amazonUrl` directly (now a proper detail page URL with affiliate tag, not a search URL)

**Edit: `src/hooks/useGearIntel.ts`**
- Add `detailPageUrl` to the `GearItem` interface (optional, falls back to existing `amazonUrl`)

### What You Get

- High-quality official Amazon product photos for every gear item
- Direct product detail page links (instead of search page links) with your affiliate tag
- Real product titles from Amazon to cross-reference with Perplexity recommendations
- No more broken images -- `m.media-amazon.com` URLs are meant to be embedded

### Technical Details

```text
Flow:
User searches "beach vacation"
  -> Edge function calls Perplexity (gets 20 product names)
  -> Edge function gets OAuth token from Amazon Cognito
  -> Edge function calls SearchItems for each product (batched)
  -> Merges Amazon images + URLs into Perplexity results
  -> Caches enriched result
  -> Returns to frontend
```

The SearchItems API returns up to 10 items per call, so we only need 1 result per product search (set `itemCount: 1`). With 20 products, that's 20 API calls, but they can be parallelized with `Promise.allSettled` to keep latency reasonable. The results are cached for 7 days so subsequent users get instant responses.
