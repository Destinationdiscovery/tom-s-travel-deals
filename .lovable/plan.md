

## Fix the Two Misconfigured Secrets

The client ID and secret you provided are already stored correctly in their own dedicated secrets (`AMAZON_CREATORS_CLIENT_ID` and `AMAZON_CREATORS_CLIENT_SECRET`). Those are fine.

The problem is two **other** secrets that got overwritten with credential values by mistake:

### What needs to change

| Secret Name | Current (wrong) value | Correct value |
|---|---|---|
| `AMAZON_CREATORS_VERSION` | `1t8k8hh19ia24jhdojtdu1ahpuiob7e6mharrh7577nutmqledgh` (the client secret was pasted here) | `2.1` |
| `AMAZON_ASSOCIATE_TAGS` | `1t8k8hh19ia24jhdojtdu1ahpuiob7e6mharrh7577nutmqledgh` (the client secret was pasted here too) | `{"CA":"gen80s01-20","US":"destinati0a78-20","GB":"uktripreviews-21"}` |

### Steps

1. Update `AMAZON_CREATORS_VERSION` -- type exactly: **2.1**
2. Update `AMAZON_ASSOCIATE_TAGS` -- type exactly: **{"CA":"gen80s01-20","US":"destinati0a78-20","GB":"uktripreviews-21"}**
3. Clear the `gear_intel_cache` table so stale results are removed
4. Redeploy the `travel-gear-intel` function so it picks up the corrected values
5. Test by searching on the Gear page

### Why these values matter

- **Version 2.1** tells the code to use the North America Cognito endpoint (`us-east-1`) for OAuth and sends the correct `Authorization: Bearer <token>, Version 2.1` header that Amazon expects.
- **Associate Tags JSON** maps each country to your affiliate tracking ID so you earn commissions on clicks.

Your client ID and client secret are **not** changing -- they are already correct.

