

# Rich Booking Detail View + Clickable Calendar Events

## What Changes

Two improvements to make bookings fully accessible from everywhere:

### 1. Calendar events become clickable to open booking details
Currently, clicking a calendar event toggles its completion. Instead, clicking an event that has a `booking_number` will open the full booking detail dialog (the same one from the Bookings tab). Events without a booking number will still open the single-event edit dialog as they do now.

### 2. Richer booking detail dialog
The existing detail dialog gets expanded to show everything about the booking in one place:
- Client name, email
- Supplier
- Booking number
- Resort/trip name
- Trip date range prominently displayed
- Events timeline with completion toggles (already exists)
- Documents section with image previews for image files (not just file names)
- Download links for all docs

## Technical Details

### File: `src/components/dashboard/BookingCalendar.tsx`

1. Import and reuse the booking detail dialog pattern from BookingManager
2. Add state for `detailOpen`, `selectedBooking`, `detailEvents`, `detailDocuments`
3. Add the `openBookingDetail` function (same logic as BookingManager -- fetches events by booking_number and docs from storage)
4. Modify the grid view event click handler: if the event has a `booking_number`, call `openBookingDetail` instead of `toggleComplete`. If no booking_number, open the edit dialog as before
5. Modify the list view: add a click handler on the row that opens the detail if there is a booking_number
6. Add the detail dialog JSX (same structure as BookingManager's detail dialog)
7. Fix the duplicate "Add Event" button (line 184 is a duplicate of line 183)

### File: `src/components/dashboard/BookingManager.tsx`

1. Enhance the detail dialog to show document image previews inline (for .jpg, .png, .webp files) instead of just file names with download icons
2. Use signed URLs for images so they render in the detail view
3. Add a visual header section with the trip date range displayed prominently

### No database changes needed
Everything uses existing tables and storage bucket.

