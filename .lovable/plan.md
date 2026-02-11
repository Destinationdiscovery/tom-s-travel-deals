

## Fix Amazon Creators API 401 Errors

### Root Cause
The OAuth token is obtained successfully (scope fix worked), but SearchItems rejects it with 401. The Amazon Creators API uses **different Cognito endpoints per credential version**:
- Version 2.1 (NA): `us-east-1`
- Version 2.2 (EU): `eu-south-2`
- Version 2.3 (FE): `us-west-2`

The code hardcodes `us-east-1`. If your credentials use a different version, the token is issued by the wrong Cognito pool and gets rejected.

### Changes

**`supabase/functions/travel-gear-intel/index.ts`**

1. **Dynamic Cognito endpoint** -- Read `AMAZON_CREATORS_VERSION` and map to the correct region:
   ```text
   "2.1" -> us-east-1
   "2.2" -> eu-south-2
   "2.3" -> us-west-2
   ```

2. **Log 401 response body** -- On search failure, log `await response.text()` so we can see Amazon's actual error message instead of just "401".

3. **Robust `AMAZON_ASSOCIATE_TAGS` parsing** -- Trim and strip BOM characters before JSON.parse to fix the recurring parse failure.

4. **Fallback Amazon URLs for must-haves items** -- When enrichment fails, construct a search URL with the affiliate tag (already done for `review` type, missing for individual `must-haves` items).

**Database**
- Clear `gear_intel_cache` to force fresh API calls.

**Redeploy `travel-gear-intel`**

