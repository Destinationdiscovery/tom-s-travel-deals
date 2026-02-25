

# Plan: Email Notifications for Calendar Reminders & Newsletter Signups

## Overview
Two notification features, both sending to your email (tlaracy@travelonly.com):
1. **Payment reminders** -- daily check for deposit_due/final_payment events 4 days away or due today
2. **Newsletter signup alerts** -- instant notification when someone subscribes

Since your domain isn't verified yet, both will use `onboarding@resend.dev` as the sender (Resend sandbox allows sending to your own account email).

## Changes

### 1. New Edge Function: `supabase/functions/payment-reminders/index.ts`

- Runs daily via `pg_cron` at 8 AM EST (13:00 UTC)
- Queries `bookings` table for `deposit_due` and `final_payment` events where `event_date` is today or 4 days from now, and `is_completed = false`
- For each match, sends a styled HTML email to tlaracy@travelonly.com with client name, booking number, supplier, event type, due date, and days remaining
- Groups multiple reminders into a single digest email rather than spamming individual emails

### 2. Update: `supabase/functions/subscribe/index.ts`

- After successfully saving the subscriber, fire-and-forget a notification email to tlaracy@travelonly.com
- Email includes the new subscriber's email, interests they selected, and the page they signed up from (source_slug)
- Uses the existing `send-email` function internally

### 3. Cron Job Setup (SQL insert)

- Enable `pg_cron` and `pg_net` extensions
- Schedule daily HTTP POST to the `payment-reminders` function at 13:00 UTC

### 4. Config: `supabase/config.toml`

- Add `[functions.payment-reminders]` with `verify_jwt = false`

## File Summary

| File | Action |
|------|--------|
| `supabase/functions/payment-reminders/index.ts` | **Create** -- daily payment reminder digest |
| `supabase/functions/subscribe/index.ts` | **Edit** -- add signup notification to your email |
| `supabase/config.toml` | **Edit** -- register new function |
| SQL (pg_cron) | **Insert** -- schedule daily reminder job |

