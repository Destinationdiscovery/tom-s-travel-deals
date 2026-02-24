

# Disable Welcome Email (Temporary)

Comment out the welcome email trigger in the `subscribe` edge function so signups still work but no email is sent. This is a single-line change that's easy to re-enable later.

## What Changes

**File:** `supabase/functions/subscribe/index.ts`
- Remove (comment out) the fire-and-forget fetch call to `send-welcome-email` (lines ~44-52)
- Subscriptions will still save to the database as normal
- When you're ready to re-enable, just uncomment those lines

## What Stays the Same
- Email capture popup and footer form continue to work
- Subscriber data is still saved to the database with interests and source tracking
- Analytics tracking still fires
- The `send-welcome-email` function stays deployed (no deletion needed) so it's ready when your domain is verified

