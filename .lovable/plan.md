
# Enhanced Trip Report with Rich Cruise Data

## Overview

The current Trip Report page only displays basic fields: resort name, destination, room type, flights, pricing, and a generic "extras" badge list. You pasted a cruise booking with rich data -- itinerary ports, passenger details with passport info, payment history, cabin category/deck info, agency info, rate codes, and a detailed payment schedule. The report needs to capture and display all of this beautifully.

This requires three changes:
1. Add new JSONB columns to `booking_details` for itinerary, passengers, and payment_history
2. Expand the AI edge function tool schemas to extract these new fields
3. Redesign the BookingReport page with new visual sections

## What Changes

### 1. Database Migration -- 3 new JSONB columns on `booking_details`

Add three nullable JSONB columns:
- `itinerary` -- array of port stops with date, port name, arrival/departure times
- `passengers` -- array of traveller objects with name, DOB, citizenship, passport, options
- `payment_history` -- array of payment records with date, type, amount, method, status

Also add text columns for:
- `agency` -- agency name
- `booking_agent` -- agent name
- `cabin_number` -- cabin assignment
- `cabin_category` -- category name (e.g. "Interior (IE)")
- `deck` -- deck assignment
- `bed_configuration` -- bed config (e.g. "QUEEN")
- `rate_code` -- rate code description
- `ship_name` -- ship name (e.g. "Sun Princess")
- `cruise_line_booking_number` -- secondary booking reference
- `balance_due` -- amount still owing
- `balance_due_date` -- when balance is due
- `duration_nights` -- trip duration in nights
- `booking_status` -- e.g. "Confirmed"

### 2. Edge Function Update -- `booking-assistant/index.ts`

Expand both `create_booking` and `add_to_booking` tool parameter schemas to include:
- `itinerary` array (date, port, arrival, departure)
- `passengers` array (name, dob, citizenship, passport info, options)
- `payment_history` array (date, type, amount, method, status)
- `agency`, `booking_agent`, `cabin_number`, `cabin_category`, `deck`, `bed_configuration`, `rate_code`, `ship_name`, `cruise_line_booking_number`, `balance_due`, `balance_due_date`, `duration_nights`, `booking_status`

Update the system prompt to instruct the AI to extract these additional fields.

### 3. BookingReport Page Redesign

New sections added to the report layout:

```text
+--------------------------------------------------+
|  HEADER BANNER                                    |
|  Sun Princess - 7 Night Mediterranean             |
|  Princess Cruises  |  #60013383  |  CONFIRMED     |
|  Aug 15 - Aug 22, 2026  |  Rome, Italy            |
+--------------------------------------------------+
|                                                    |
|  LEFT COLUMN (3/5)           RIGHT COLUMN (2/5)   |
|                                                    |
|  TRIP OVERVIEW               QUICK FACTS          |
|  Client, Agency, Agent       Booking #             |
|  Cabin, Deck, Bed Config     Cruise Line Ref      |
|  Rate Code, Duration         Supplier              |
|                              Ship                  |
|  PASSENGERS                  Cabin / Deck          |
|  Card per traveller          Duration              |
|  Name, DOB, Age, Citizenship                      |
|  Passport # / Expiry         PRICING              |
|  Special Options             Total, Deposit,       |
|                              Balance Due,          |
|  PORT-BY-PORT ITINERARY      Taxes, Per Person     |
|  Visual timeline with                             |
|  day number, date, port,     PAYMENT HISTORY      |
|  arrival/departure times     Date, Type, Amount   |
|  Sea day styling             Method, Status        |
|                                                    |
|  FLIGHT ITINERARY            ACTIONS              |
|  (if applicable)             Re-scan, Delete       |
|                                                    |
|  EVENTS TIMELINE                                  |
|  DOCUMENTS & PHOTOS                               |
+--------------------------------------------------+
|  CHAT BAR                                         |
+--------------------------------------------------+
```

**Passengers Section**: A card per traveller showing name, date of birth with age, citizenship flag, passport number (partially masked) and expiry, and any special options/requests.

**Itinerary Section**: A visual day-by-day timeline. Each port day shows the port name prominently with arrival/departure times. "At Sea" days are styled differently with a wave icon. Day numbers are shown (Day 1, Day 2, etc.).

**Payment History Section**: A clean table in the sidebar showing each payment with date, type (Deposit/Balance), amount, payment method, and status badge (Processed/Pending).

**Balance Due**: Prominently displayed in the pricing card with the due date highlighted.

### 4. ClientFile + BookingReport Data Flow

Both `ClientFile.tsx` and `BookingReport.tsx` `upsertBookingDetails` and merge logic will be updated to handle the new fields -- passing through itinerary, passengers, payment_history, and all new text fields from the AI response to the database.

## Technical Details

### Database Migration SQL

```sql
ALTER TABLE booking_details
  ADD COLUMN IF NOT EXISTS itinerary jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS passengers jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS payment_history jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS agency text,
  ADD COLUMN IF NOT EXISTS booking_agent text,
  ADD COLUMN IF NOT EXISTS cabin_number text,
  ADD COLUMN IF NOT EXISTS cabin_category text,
  ADD COLUMN IF NOT EXISTS deck text,
  ADD COLUMN IF NOT EXISTS bed_configuration text,
  ADD COLUMN IF NOT EXISTS rate_code text,
  ADD COLUMN IF NOT EXISTS ship_name text,
  ADD COLUMN IF NOT EXISTS cruise_line_booking_number text,
  ADD COLUMN IF NOT EXISTS balance_due numeric,
  ADD COLUMN IF NOT EXISTS balance_due_date text,
  ADD COLUMN IF NOT EXISTS duration_nights integer,
  ADD COLUMN IF NOT EXISTS booking_status text;
```

### Files Modified

- `supabase/functions/booking-assistant/index.ts` -- expanded tool schemas and system prompt
- `src/pages/BookingReport.tsx` -- new Passengers, Itinerary, Payment History sections; enhanced pricing with balance due
- `src/pages/ClientFile.tsx` -- updated merge logic for new fields
- Database migration for new columns

### No breaking changes

All new columns are nullable with defaults. Existing bookings continue to display as before -- the new sections only render when data is present.
