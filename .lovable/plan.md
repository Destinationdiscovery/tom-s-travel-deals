

# Separate Bookings Tab from Calendar

## What Changes

The "Add Full Booking" functionality (with AI import) moves out of the Calendar tab into its own **Bookings** tab in the sidebar. The Calendar tab keeps only the grid/list view and the "Add Event" button for quick one-off entries.

## Sidebar Update

A new "Bookings" tab appears between **Clients** and **Calendar** in the sidebar, using a briefcase/clipboard icon.

## Bookings Tab (new standalone component)

This is where you create and manage full bookings. It will contain:
- A list/table of all bookings grouped by booking number (pulled from the `bookings` table, grouped by `booking_number`)
- An "Add Booking" button that opens the full booking form (client, resort, booking number, supplier, all dates)
- The upcoming AI import button (from the approved plan) will live here too
- Each booking row shows: client name, supplier, booking number, trip dates, and number of calendar events generated
- Click a booking to edit its details

## Calendar Tab (simplified)

- Remove the "Add Full Booking" button -- only the "Add Event" button remains
- The calendar grid/list view stays exactly as-is, showing all events from the `bookings` table
- You can still click events to edit/complete them

## Technical Details

### Files to modify

**`src/components/dashboard/DashboardSidebar.tsx`**
- Add `"bookings"` to the `DashboardTab` type
- Add a Bookings entry in the tabs array (between Clients and Calendar)

**`src/components/dashboard/BookingCalendar.tsx`**
- Remove the "Add Full Booking" button from the header
- Remove the full booking dialog and all related state/handlers (`fullBookingOpen`, `fullBooking`, `openFullBooking`, `handleFullBookingSave`, `handleClientSelectFullBooking`)
- Keep everything else (grid, list, single event add/edit)

**`src/pages/GearAdmin.tsx`**
- Import and wire up the new `BookingManager` component for the `"bookings"` tab

### New file to create

**`src/components/dashboard/BookingManager.tsx`**
- Contains the full booking form (moved from BookingCalendar) plus a bookings list view
- Lists all bookings grouped by `booking_number` from the `bookings` table
- "Add Booking" button opens the full booking form dialog
- On save, creates calendar events in the `bookings` table (same logic as current `handleFullBookingSave`)
- This is also where the AI import feature will be added next

### No database changes required
Everything uses the existing `bookings` table.

