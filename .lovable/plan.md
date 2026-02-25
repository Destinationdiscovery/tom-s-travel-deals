

# Plan: Test Newsletter Signup Notification

## What We'll Do

Trigger the `subscribe` Edge Function with a fake test email to verify the admin notification arrives at tlaracy@travelonly.com.

## Steps

1. **Call the `subscribe` function** via HTTP POST with test data:
   - Email: `test-user-123@example.com`
   - Source: `manual-test`
   - Interests: `["destinations", "deals"]`

2. **Expected result**: The function will:
   - Insert (or upsert) the test subscriber into the `subscribers` table
   - Fire off an admin notification email to tlaracy@travelonly.com with the subscriber details

No file changes needed -- just a function invocation.

