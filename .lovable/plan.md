

# Consolidated Client Files

## Overview

Right now, the Bookings tab shows one row per booking number -- so Tom Mercante appears as two separate rows (one for each booking). You want one row per client, and clicking that row opens a single "Client File" page showing all their bookings inside it.

## What Changes

### 1. BookingManager table -- group by client instead of booking number

The table currently groups by `booking_number`. It will be changed to group by `client_name` (case-insensitive), showing:
- Client name and email
- Number of bookings they have
- Their upcoming trip (nearest future date)
- Clicking navigates to `/client/:clientSlug`

### 2. New Client File page at `/client/:clientSlug`

A full-page view similar in style to the existing Trip Report, but structured around the client rather than a single booking. Layout:

```text
+--------------------------------------------------+
|  HEADER                                           |
|  Client Name (large)             Email badge      |
|  "2 bookings  |  4 documents"                     |
+--------------------------------------------------+
|                                                    |
|  BOOKING CARDS (stacked)                          |
|                                                    |
|  +----------------------------------------------+ |
|  | Booking 1: Hotel Villa Igea Sorrento          | |
|  | #73378097887271  |  Supplier  |  Trip Dates   | |
|  | Flight / Pricing / Extras summary             | |
|  | [View Full Report]                            | |
|  +----------------------------------------------+ |
|                                                    |
|  +----------------------------------------------+ |
|  | Booking 2: Hotel Sassi Matera                 | |
|  | #73378100371257  |  Supplier  |  Trip Dates   | |
|  | Flight / Pricing / Extras summary             | |
|  | [View Full Report]                            | |
|  +----------------------------------------------+ |
|                                                    |
|  DOCUMENTS SECTION                                |
|  All files from booking-documents/{client-slug}   |
|                                                    |
+--------------------------------------------------+
|  CHAT BAR (attach docs / add booking to client)   |
|  [paperclip] Upload docs or describe booking...   |
+--------------------------------------------------+
```

- Each booking card is a summary with a "View Full Report" button linking to the existing `/booking/:bookingNumber` page
- Documents section shows all files in the client's storage folder (shared across bookings)
- Chat bar lets you upload new documents and the AI creates a new booking under this client or adds to an existing one
- Re-scan button processes all documents for all bookings

### 3. BookingReport stays as-is

The existing `/booking/:bookingNumber` page remains for deep-diving into a single booking. The back button will navigate back to the client file instead of the bookings list.

### 4. Calendar navigation updated

Calendar event clicks will navigate to `/client/:clientSlug` instead of `/booking/:bookingNumber`, keeping the consolidated approach consistent.

### 5. Storage stays the same

Documents are already stored per-client slug (`booking-documents/{client-slug}/`), which aligns perfectly with this approach. No storage changes needed.

## Technical Details

### New file: `src/pages/ClientFile.tsx`
- Route param: `clientSlug` (e.g., "tom-mercante")
- Fetches all bookings where `lower(trim(client_name))` slugifies to the param
- Fetches all `booking_details` rows for those booking numbers
- Fetches all documents from `booking-documents/{clientSlug}/`
- Includes chat bar with AI processing (reuses same `booking-assistant` edge function)
- Includes re-scan functionality across all bookings

### Modified: `src/components/dashboard/BookingManager.tsx`
- Change grouping from `booking_number` to `client_name` (case-insensitive)
- Table columns: Client, Bookings count, Upcoming Trip, Last Activity
- Row click navigates to `/client/:clientSlug`

### Modified: `src/components/dashboard/BookingCalendar.tsx`
- Event clicks navigate to `/client/:clientSlug` instead of `/booking/:bookingNumber`

### Modified: `src/App.tsx`
- Add route: `/client/:clientSlug` pointing to `ClientFile.tsx`
- Keep existing `/booking/:bookingNumber` route

### No database or edge function changes needed
The `bookings`, `booking_details` tables, and `booking-assistant` edge function all work as-is. This is purely a frontend restructuring of how data is presented.
