

## Fix Misconfigured Amazon Creators API Secrets

### Problem
The client secret was accidentally stored in the `AMAZON_CREATORS_VERSION` field. This causes the code to use the hash as a version string, which breaks both the Cognito region lookup and the `Authorization` header.

### Changes

1. **Update `AMAZON_CREATORS_VERSION`** secret from the current hash to `2.1`
2. **Verify `AMAZON_CREATORS_CLIENT_ID`** is set to `1delk9ffhultnp598teu0tdjvj`
3. **Verify `AMAZON_CREATORS_CLIENT_SECRET`** is set to `1t8k8hh19ia24jhdojtdu1ahpuiob7e6mharrh7577nutmqledgh`
4. **Verify `AMAZON_ASSOCIATE_TAGS`** is set to `{"CA":"gen80s01-20","US":"destinati0a78-20","GB":"uktripreviews-21"}`
5. **Clear `gear_intel_cache`** table to force fresh API calls with the corrected credentials
6. **Redeploy `travel-gear-intel`** edge function

### Why This Fixes It
With version correctly set to `2.1`:
- The code maps to Cognito region `us-east-1` (North America)
- The OAuth token is obtained from the correct Cognito pool
- The `Authorization: Bearer <token>, Version 2.1` header is accepted by the Amazon Creators API
- Product images and affiliate links will load on the Gear page

