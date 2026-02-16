

# Update Hardcoded Admin ID

## Problem
The `AuthProvider.tsx` file has a hardcoded `ADMIN_USER_ID` constant set to an old placeholder value (`f4b1009b-...`). Your actual user ID is `6991cf75-b1d3-4cf0-873a-bca64f7bfaaa`.

## Solution
Instead of hardcoding the admin ID, query the `user_roles` table to determine admin status dynamically. This is more robust and already supported by the database infrastructure we set up.

## Changes

### 1. `src/components/auth/AuthProvider.tsx`
- Remove the hardcoded `ADMIN_USER_ID` constant.
- Add a state variable `isAdmin` that is resolved by querying `public.user_roles` when the user session changes.
- Use the existing `has_role` pattern: query `user_roles` where `user_id` matches and `role = 'admin'`.

### Technical Detail
When `session` changes and a user is present, run:
```sql
SELECT 1 FROM user_roles WHERE user_id = '<uid>' AND role = 'admin'
```
If a row is returned, set `isAdmin = true`. This keeps admin checks server-authoritative rather than relying on a hardcoded UUID.

