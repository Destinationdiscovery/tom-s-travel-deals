
## Fix Amazon Creators API + Clear Cards on New Search

Two issues to fix: the Amazon API calls are failing due to incorrect request format, and previous results should clear when starting a new search.

### Issue 1: Amazon Creators API Not Working

The edge function logs show `Amazon OAuth error: 400 {"error":"invalid_scope"}`. After reviewing the official Amazon Creators API documentation, the current implementation has **four errors**:

1. **Wrong OAuth scope** -- Code sends `scope=catalog/v1/searchItems`, but the correct scope is `creatorsapi/default`
2. **SearchItems is a POST, not a GET** -- Code sends a GET request with query parameters, but the API expects a POST with a JSON body
3. **Wrong API domain** -- Code uses `creatorsapi.amazon.com` but the correct base URL is `creatorsapi.amazon` (no `.com`)
4. **Missing Version in Authorization header** -- The API requires `Authorization: Bearer TOKEN, Version VERSION`, not just `Bearer TOKEN`. A new secret `AMAZON_CREATORS_VERSION` is needed (the credential version like "2.1" for North America)

### Issue 2: Clear Previous Cards on New Search

Currently when you search again, the old packing list cards stay visible. The fix is to clear `packingData` immediately when a new search starts, so the loading animation shows cleanly (like the screenshot reference).

### Files to Change

**Add Secret: `AMAZON_CREATORS_VERSION`**
- Store your credential version (e.g., "2.1" for NA, "2.2" for EU, "2.3" for FE)

**Edit: `supabase/functions/travel-gear-intel/index.ts`**
- Fix `getAmazonOAuthToken()`:
  - Change scope from `"catalog/v1/searchItems"` to `"creatorsapi/default"`
- Fix `searchAmazonProduct()`:
  - Change from GET with query params to POST with JSON body
  - Change URL from `https://creatorsapi.amazon.com/catalog/v1/searchItems` to `https://creatorsapi.amazon/catalog/v1/searchItems`
  - Add `Version` to the Authorization header: `Bearer ${token}, Version ${version}`
  - Read version from `AMAZON_CREATORS_VERSION` env var (default "2.1")
  - Request body should be: `{ keywords, partnerTag, marketplace, itemCount: 1, resources: ["images.primary.large", "itemInfo.title"] }`
  - Add `Content-Type: application/json` header

**Edit: `src/hooks/useGearIntel.ts`**
- In `fetchPackingList()`, add `setPackingData(null)` at the start (before `setLoading(true)`) so previous cards are immediately removed and the loading animation shows

**Clear cache**
- Run `DELETE FROM gear_intel_cache` to remove stale entries

**Redeploy `travel-gear-intel`**

### Corrected API Call Shape

```text
OAuth Token Request:
  POST https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token
  Headers: Content-Type: application/x-www-form-urlencoded
           Authorization: Basic base64(clientId:clientSecret)
  Body: grant_type=client_credentials&scope=creatorsapi/default

SearchItems Request:
  POST https://creatorsapi.amazon/catalog/v1/searchItems
  Headers: Authorization: Bearer TOKEN, Version 2.1
           Content-Type: application/json
           x-marketplace: www.amazon.ca
  Body: {
    "keywords": "Osprey Farpoint 40",
    "partnerTag": "gen80s01-20",
    "marketplace": "www.amazon.ca",
    "itemCount": 1,
    "resources": ["images.primary.large", "itemInfo.title"]
  }
```
