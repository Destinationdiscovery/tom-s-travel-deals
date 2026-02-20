
# Clickable Booking Detail View

## What Changes

Each booking row in the table becomes clickable. Clicking it opens a detail dialog showing all the booking information: client details, supplier, booking number, all calendar events with their dates and completion status, and any uploaded documents from the storage bucket.

## Detail Dialog Contents

- **Header**: Trip/resort name with booking number badge
- **Client Info**: Name and email
- **Supplier**: Travel provider
- **Events Timeline**: A list of all calendar events for this booking (Booked, Deposit Due, Final Payment, Trip Start, Trip End) with dates, completion checkboxes, and notes
- **Documents**: List of uploaded files from the `booking-documents` storage bucket under the client's folder, with download links
- **Actions**: Edit and delete options

## Technical Details

### File: `src/components/dashboard/BookingManager.tsx`

1. **Add state** for selected booking: `selectedBooking: BookingGroup | null` and a detail dialog open flag

2. **Make table rows clickable** by adding `onClick` and `cursor-pointer` styling to each `TableRow`

3. **Fetch full event details** when a booking is clicked: query `bookings` table filtered by `booking_number` to get all individual events (dates, types, completion status, notes)

4. **Fetch documents** from the `booking-documents` storage bucket by listing files under the client's slugified name folder

5. **New detail dialog** showing:
   - Client name, email, supplier, booking number at the top
   - Events list with date, type label, completion toggle (updates `is_completed` in DB), and notes
   - Documents section with file names and download links (using `getPublicUrl` or `createSignedUrl`)
   - A delete booking button that removes all events for that booking number

6. **Toggle event completion** inline -- clicking a checkbox updates `is_completed` on that specific booking row

No new files, no database changes -- everything uses the existing `bookings` table and `booking-documents` storage bucket.
