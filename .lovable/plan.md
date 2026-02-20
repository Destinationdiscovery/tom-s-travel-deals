

# Booking Detail "Trip Listing" Page

## Overview

Transform the booking detail view from a basic info card into a rich, professional "trip listing" -- like a real estate listing but for travel bookings. The AI will extract far more details from uploaded documents (room type, flight info, destination, pricing, etc.) and store them in a dedicated table. When you click a booking, you see everything on one beautiful page, plus a chat input to add more info at any time.

## What Changes

### 1. New database table: `booking_details`

Right now the `bookings` table only stores calendar events (one row per event). There is nowhere to store rich trip data like room type, flight info, pricing, etc. A new `booking_details` table will hold one row per booking with all extracted details:

- `booking_number` (unique key)
- `client_name`, `client_email`, `supplier`, `resort_name`
- `destination` (city/country)
- `room_type` (e.g., "Ocean View Junior Suite")
- `flight_details` (JSONB -- airline, flight numbers, departure/arrival times, airports)
- `pricing` (JSONB -- total cost, deposit amount, taxes, per-person breakdown)
- `num_travellers` (integer)
- `extras` (JSONB -- anything else the AI finds: transfer info, meal plan, insurance, special requests)
- `created_at`, `updated_at`
- RLS: admin-only (same as bookings table)

### 2. Smarter AI extraction (edge function update)

The `booking-assistant` edge function's `create_booking` tool gets expanded with new fields: `destination`, `room_type`, `flight_details` (object with airline, flight numbers, times), `pricing` (object with total, deposit, taxes), `num_travellers`, and `extras` (array of key-value pairs for anything else found).

The system prompt is updated to tell the AI to extract every possible detail from the documents -- room types, flight itineraries, pricing breakdowns, meal plans, transfer info, insurance, etc.

### 3. Store rich data on booking creation

When the AI returns `create_booking`, the frontend will now also insert a row into `booking_details` with all the extracted data, alongside the existing calendar event creation.

### 4. Redesigned detail view -- the "Trip Listing"

The dialog becomes a full, scrollable listing page with these sections:

**Header Banner**
- Resort/trip name large
- Booking number badge
- Supplier label
- Trip date range with calendar icon

**Trip Overview Card**
- Client name and email
- Destination
- Room type
- Number of travellers
- Any extras (meal plan, transfers, insurance) shown as labeled rows

**Flight Details Card** (if available)
- Outbound flight: airline, flight number, departure airport/time, arrival airport/time
- Return flight: same format
- Formatted nicely as a mini itinerary

**Pricing Card** (if available)
- Total cost
- Deposit amount
- Taxes/fees
- Per-person breakdown if extracted

**Events Timeline**
- Same vertical timeline with completion toggles (already built)

**Documents and Photos**
- Same image previews and file downloads (already built)

**In-Booking Chat Input**
- A ChatGPT-style input bar at the bottom of the detail view
- Lets you type things like "add the flight change email" or attach more documents
- Calls the same `booking-assistant` edge function with context about THIS booking
- New documents get uploaded to storage, new details get merged into `booking_details`

**Delete Action**
- Same destructive delete at the very bottom

### 5. Calendar integration stays the same
Clicking a booking-linked calendar event still opens this same detail view.

## Technical Details

### Database Migration
- Create `booking_details` table with columns listed above
- Add RLS policy: admin ALL using `has_role(auth.uid(), 'admin')`
- Add unique constraint on `booking_number`

### Edge Function: `supabase/functions/booking-assistant/index.ts`
- Expand the `create_booking` tool parameters to include `destination`, `room_type`, `flight_details`, `pricing`, `num_travellers`, `extras`
- Update the `add_to_booking` tool to also return extracted details for merging
- Update the system prompt to instruct the AI to extract every detail it can find

### Frontend: `src/components/dashboard/BookingManager.tsx`
- Add state for `bookingDetails` (the rich data from `booking_details` table)
- In `openBookingDetail`, also fetch from `booking_details` table
- On `create_booking` AI response, also insert into `booking_details`
- Replace the current Trip Details card with the full multi-section listing layout
- Add the in-booking chat bar (reuse the same chat logic but scoped to the selected booking)
- On `add_to_booking` AI response, merge/update the `booking_details` row

### Frontend: `src/components/dashboard/BookingCalendar.tsx`
- No changes needed -- it already calls `openBookingDetail` which will now show the richer view

