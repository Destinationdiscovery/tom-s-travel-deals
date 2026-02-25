

# Plan: Add Test Booking Entry and Trigger Payment Reminder

## Steps

1. **Insert a test booking** into the `bookings` table with `event_type = 'deposit_due'`, `event_date = today (2026-02-25)`, and `is_completed = false` using made-up client data.

2. **Trigger the `payment-reminders` Edge Function** via HTTP POST to verify the email arrives at tlaracy@travelonly.com.

No file changes needed -- this is purely database insert + function invocation.

