

## Fix Misconfigured Secrets

### Problem
Two secrets have incorrect values -- they contain credential hashes instead of the expected formats:

1. **`AMAZON_CREATORS_VERSION`** currently contains: `1t8k8hh19ia24jhdojtdu1ahpuiob7e6mharrh7577nutmqledgh`  
   Should be: `2.1` (since your account is Amazon Canada / North America)

2. **`AMAZON_ASSOCIATE_TAGS`** likely also contains a hash instead of:  
   `{"CA":"gen80s01-20","US":"destinati0a78-20","GB":"uktripreviews-21"}`

### Changes

1. **Update `AMAZON_CREATORS_VERSION` secret** to the value `2.1`
2. **Update `AMAZON_ASSOCIATE_TAGS` secret** to `{"CA":"gen80s01-20","US":"destinati0a78-20","GB":"uktripreviews-21"}`
3. **Clear `gear_intel_cache`** table to force fresh API calls
4. **Redeploy `travel-gear-intel`** edge function

### Why This Fixes It
With version set to `2.1`, the code will correctly resolve to Cognito region `us-east-1`, generate a valid OAuth token, and the `Authorization: Bearer <token>, Version 2.1` header will be accepted by the Amazon Creators API.

