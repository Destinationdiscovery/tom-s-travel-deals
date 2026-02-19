

# Quote-to-Booking Flow and Calendar Overhaul

## Overview

Redesign the Quote Builder and Booking Calendar to follow a natural travel agent workflow: create a quote (which creates a client file by last name), then convert that quote into calendar bookings with all key dates. The calendar gets new date types and a booking number field. Previously created client files become selectable via dropdown.

## Changes

### 1. Database: New booking fields and event types

Add new event types to the `booking_event_type` enum:
- `deposit_due` -- deposit payment deadline
- `trip_start` -- first day of the trip
- `trip_end` -- last day of the trip

Add new columns to the `bookings` table:
- `booking_number` (text, nullable) -- the supplier/tour operator booking reference
- `quote_id` (already exists but currently unused) -- links booking entries back to the originating quote

### 2. Quote Builder: "Book" action on client files

After a quote is saved, each quote in the client file accordion gets a **"Book"** button alongside the existing load button. Clicking "Book" opens a dialog pre-filled with the client name, email, resort name, and trip dates from the quote. The dialog lets you enter:

- Booking Number (text input)
- Date Booked (date picker)
- Deposit Due Date (date picker)
- Final Payment Due Date (date picker)
- Trip Start Date (pre-filled from quote check-in)
- Trip End Date (pre-filled from quote check-out)

Clicking "Save Booking" creates multiple entries in the `bookings` table (one per date type: booking, deposit_due, final_payment, trip_start, trip_end), all linked to the quote via `quote_id`. The quote status is updated to `booked`. All dates immediately appear on the calendar.

### 3. Client File Dropdown

When starting a new quote, a dropdown appears above the client name field listing all previously created client files (unique client names from `client_quotes`). Selecting one auto-fills the client name and email fields. You can still type a new name to create a new file.

### 4. Calendar Enhancements

- Add the new event types (`deposit_due`, `trip_start`, `trip_end`) with distinct colors and labels
- Add `booking_number` display on calendar event chips (e.g., "Smith - BK12345")
- Update the Add Event dialog to include a Booking Number field and the new event type options
- Add a client name dropdown in the calendar's Add Event dialog that populates from existing client files (same as the quote builder)

### 5. "Add Booking" from Calendar (no quote)

The existing "Add Event" on the calendar is enhanced to also support the multi-date booking flow. A new "Add Full Booking" button opens a dialog similar to the quote's Book dialog (client name dropdown, booking number, all date fields) and creates multiple calendar entries at once.

## Technical Details

### Database Migration

```text
-- Add new enum values
ALTER TYPE booking_event_type ADD VALUE IF NOT EXISTS 'deposit_due';
ALTER TYPE booking_event_type ADD VALUE IF NOT EXISTS 'trip_start';
ALTER TYPE booking_event_type ADD VALUE IF NOT EXISTS 'trip_end';

-- Add booking_number column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_number text;
```

### File: `src/components/dashboard/QuoteBuilder.tsx`

- Add a "Book" button to each quote row in the client files accordion
- Create a `BookingFromQuoteDialog` component (inline or separate) with:
  - Pre-filled client name, email from the quote
  - Booking Number input
  - Date fields: Date Booked, Deposit Due, Final Payment Due, Trip Start, Trip End
  - On save: inserts up to 5 booking rows (one per date provided), all with the same `quote_id` and `booking_number`
  - Updates the quote status to "booked"
- Add a client file dropdown (Select component) above the Client Name input in Step 2
  - Options populated from unique client names in `client_quotes`
  - Selecting one fills client name + email
  - "New Client" option allows manual entry

### File: `src/components/dashboard/BookingCalendar.tsx`

- Update `eventTypeLabels` and `eventTypeColors` to include the 3 new types:
  - `deposit_due`: "Deposit Due" (rose/red color)
  - `trip_start`: "Trip Start" (sky blue)
  - `trip_end`: "Trip End" (indigo)
- Add `booking_number` to the `BookingEvent` interface and form state
- Show booking number on calendar chips and in the edit dialog
- Add a client name dropdown in the event dialog (fetched from `client_quotes` unique names)
- Add an "Add Full Booking" button that opens a multi-date dialog (same pattern as the quote Book dialog)

### File: `src/components/dashboard/DashboardSidebar.tsx`

No changes needed.

### File: `src/integrations/supabase/types.ts`

Will be auto-updated after migration.

### Flow Summary

```text
Quote Builder                          Calendar
+------------------+                  +------------------+
| Create Quote     |                  |                  |
| (creates client  |                  | View all dates   |
|  file by name)   |                  | color-coded      |
+--------+---------+                  +--------+---------+
         |                                     ^
         v                                     |
+------------------+                           |
| Client File      |     "Book" button         |
| - Quote 1  [Book]+---> Creates 5 calendar ---+
| - Quote 2  [Book]|     entries with dates
| - Quote 3        |     + booking number
+------------------+
         |
         v
  Dropdown populates
  for future quotes
  with existing clients
```

### No new files needed

All changes fit within the existing `QuoteBuilder.tsx` and `BookingCalendar.tsx` files, plus one small migration.

