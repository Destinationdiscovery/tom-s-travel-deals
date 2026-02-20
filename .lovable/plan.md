

# Professional Booking Detail View

## What Changes

The current booking detail dialog gets completely redesigned into a rich, professional trip overview. Instead of the minimal layout with just a timeline and documents list, clicking a booking opens a polished detail view that presents all extracted information in organized sections -- similar to what you see on a travel supplier confirmation page.

## New Detail Layout

### Header Section
- Resort/trip name large and prominent
- Booking number badge beside it
- Trip date range with calendar icon
- Supplier name displayed clearly (e.g., "WestJet Vacations")

### Trip Details Card
- Client name and email
- Supplier
- Booking number
- Destination (parsed from the resort name or notes)
- Room type if available in notes

### Events Timeline
- Same interactive checklist as now (Booked, Deposit Due, Final Payment, Trip Start, Trip End) with dates and completion toggles
- But styled as a cleaner vertical timeline with connecting lines between events, dates on the right

### Documents and Images
- Image documents shown as large previews (not tiny thumbnails) -- these are the confirmation screenshots/photos
- Non-image files shown with download buttons
- Clicking any image opens it full-size in a new tab

### Delete Action
- Stays at the bottom as a destructive action, same as now

## Technical Details

### File: `src/components/dashboard/BookingManager.tsx`

1. **Widen the dialog** from `max-w-xl` to `max-w-2xl` to give more room for the professional layout

2. **Redesign the header** with the resort name as a large heading, booking number as an inline badge, and the date range prominently below with a calendar icon. Add supplier as a subtle label beneath.

3. **Replace the grid client/supplier section** with a more structured "Trip Details" card showing:
   - Client (name + email)
   - Supplier
   - Booking Number
   - All laid out in a clean label-value format with proper spacing

4. **Restyle the Events Timeline** to use a vertical timeline look:
   - A vertical line connecting events
   - Each event as a node on the line with the completion circle, label, and date
   - Completed events get a strikethrough and muted color
   - More padding and visual hierarchy

5. **Improve the Documents section**:
   - Image files displayed as larger previews (full-width or 2-column grid with taller aspect ratio)
   - Each image has a hover overlay with the filename
   - Non-image files in a clean list with file icon and download button

6. No database or schema changes needed -- all data is already available from the `bookings` table and `booking-documents` storage bucket

