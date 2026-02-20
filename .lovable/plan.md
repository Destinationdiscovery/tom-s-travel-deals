
# Re-scan Existing Bookings

## Problem
Existing bookings were created before the new `booking_details` table existed, so they show a bare-bones detail view with no destination, room type, flights, pricing, or extras. The documents are already uploaded in storage -- they just need to be re-processed by the AI.

## Solution
Add a "Re-scan Documents" button inside the booking detail view. When clicked, it will:

1. Fetch all documents already stored in the `booking-documents` bucket for that client
2. Download each file and convert it to base64
3. Send them all to the `booking-assistant` edge function with a message like "Extract all details from these documents for booking [number]"
4. Process the AI response the same way as `add_to_booking` -- upsert the extracted data into `booking_details`
5. Refresh the detail view to show the newly populated fields

## What Changes

### `src/components/dashboard/BookingManager.tsx`
- Add a `rescanDocuments` async function that:
  - Downloads each file from the `booking-documents` bucket using signed URLs
  - Converts them to base64
  - Calls the `booking-assistant` edge function
  - Runs `upsertBookingDetails` with the response
  - Refreshes the detail view
- Add a new state variable `rescanning` (boolean) for loading state
- Add a "Re-scan Documents" button in the detail view header banner area, visible when there are documents but no `booking_details` data (or always available as a refresh option)
- The button shows a spinner while processing

### No database or edge function changes needed
The `booking-assistant` edge function already supports the `add_to_booking` tool and extracts all the rich fields. The `booking_details` table already exists. This is purely a frontend change.

## Technical Details

The re-scan flow:

1. Use `supabase.storage.from("booking-documents").list(clientSlug)` to get file names (already done in `openBookingDetail`)
2. For each file, use `supabase.storage.from("booking-documents").download(path)` to get the blob
3. Convert each blob to base64 using FileReader
4. Call `supabase.functions.invoke("booking-assistant", { body: { message, files, existing_bookings, existing_clients } })`
5. The AI returns `add_to_booking` action with extracted fields
6. `upsertBookingDetails` saves/merges the data
7. Re-call `openBookingDetail` to refresh the view

The button will appear in the header banner next to the booking number badge, styled as a small outline button with a refresh icon.
