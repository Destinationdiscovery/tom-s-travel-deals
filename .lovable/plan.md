

# Multi-Cabin / Multi-Room Booking Support

## The Problem

You have 3 cabins on the same cruise, each with its own Encore booking number. When you upload docs for cabin 2, the AI sees it's the same trip (same ship, same dates, same client) and merges the data into the existing cabin 1 record instead of creating a separate record. You need each cabin to have its own booking_details record while being visually grouped as one trip.

## What Changes

### 1. Database -- New `trip_group_id` column

Add a nullable text column `trip_group_id` to `booking_details`. When multiple cabins belong to the same trip, they share the same group ID (e.g., the first booking number becomes the group ID). This lets the system know "these 3 booking numbers are all part of one trip."

### 2. AI Edge Function -- Teach it about multi-cabin trips

Update the `booking-assistant` system prompt with explicit multi-cabin instructions:

- If a document contains a **different booking number** than existing ones, ALWAYS use `create_booking` even if the trip/ship/dates are the same
- Add a `trip_group_id` parameter to both tools so the AI can link cabins together
- When the AI sees documents for the same ship/dates/client but a different booking number, it sets `trip_group_id` to the first cabin's booking number

### 3. Client File -- Group cabins visually

On the Client File page, booking cards with the same `trip_group_id` are grouped under a shared trip header showing the ship name, dates, and destination once, with individual cabin cards nested underneath showing:
- Cabin-specific booking number
- Cabin category, deck, bed config
- Passengers in that cabin
- Pricing for that cabin

```text
+--------------------------------------------------+
|  TRIP GROUP: Sun Princess Mediterranean           |
|  Aug 15-22, 2026 | Princess Cruises | 3 cabins   |
|                                                    |
|  [Cabin 1: #60013383]  [Cabin 2: #60013384]      |
|  Interior (IE) GUAR     Balcony (BF) GUAR        |
|  2 travellers            2 travellers              |
|  CA$2,499.68             CA$3,199.00              |
|  > Full Report           > Full Report             |
|                                                    |
|  [Cabin 3: #60013385]                             |
|  Interior (IE) GUAR                               |
|  1 traveller                                       |
|  CA$1,249.84                                      |
|  > Full Report                                     |
+--------------------------------------------------+
```

### 4. Booking Report -- Sibling cabin navigation

On each individual Trip Report page, show a small "Other Cabins" section linking to the sibling bookings in the same trip group, so the agent can quickly jump between cabins.

## Technical Details

### Database Migration

```sql
ALTER TABLE booking_details
  ADD COLUMN IF NOT EXISTS trip_group_id text;
```

### Edge Function Changes

- Add `trip_group_id` to both `create_booking` and `add_to_booking` tool schemas
- Update system prompt: "If the document has a booking number that does NOT match any existing booking, use create_booking. Different booking numbers = different cabins, even if same ship/dates. Set trip_group_id to the booking number of the first cabin in the group."

### ClientFile.tsx Changes

- After fetching booking cards, group them by `trip_group_id`
- Render grouped cards under a shared trip header
- Ungrouped bookings (no trip_group_id) render as they do today

### BookingReport.tsx Changes

- Query sibling bookings: `SELECT * FROM booking_details WHERE trip_group_id = ? AND booking_number != ?`
- Display a small "Other Cabins in This Trip" card with links

### Files Modified

- Database migration (1 new column)
- `supabase/functions/booking-assistant/index.ts` -- multi-cabin prompt and schema
- `src/pages/ClientFile.tsx` -- trip grouping UI
- `src/pages/BookingReport.tsx` -- sibling cabin navigation

### No breaking changes

The new column is nullable. Existing single-cabin bookings display exactly as they do now. Grouping only activates when `trip_group_id` is populated.

