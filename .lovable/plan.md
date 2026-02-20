

# Add "Supplier" Field to Bookings

## What Changes
A new "Supplier" text field will be added to the bookings table and all related forms/views in the Calendar tab. This lets you track which supplier (e.g., Sunwing, WestJet Vacations, Sandals) each booking is through.

## Where It Will Appear
- **List view**: Shown alongside client name and booking number
- **Single Event dialog**: New input field for Supplier
- **Full Booking dialog**: New input field for Supplier (applied to all generated calendar entries)
- **Grid view**: No change (too compact), but visible when you click into an event

## Technical Details

### Database
- Add a nullable `supplier` text column to the existing `bookings` table via migration

### Code Changes (1 file)
**`src/components/dashboard/BookingCalendar.tsx`**
- Add `supplier` to the `BookingEvent` interface
- Add `supplier` to the single-event `form` state and the `fullBooking` state
- Add a Supplier input field in both the single-event dialog and the full booking dialog
- Include `supplier` in the save/update payloads
- Show supplier in the list view (next to client name)

