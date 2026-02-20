

# Trip Report -- Full-Page Booking Presentation

## The Problem

The AI review page gathers web data and presents a beautiful, magazine-style report. The booking system gathers document data and presents... a list of key-value rows in a small dialog. Same AI extraction concept, completely different presentation quality.

## The Solution

Replace the current booking detail dialog with a full-page Trip Report that mirrors the design language of the AI review page. The AI already extracts the data -- this is purely about how we present it.

## What Changes

### 1. New dedicated route: `/booking/:bookingNumber`

Instead of a cramped dialog, booking details get their own full page -- just like reviews get `/review/:slug`. This gives room for a proper report layout.

### 2. Trip Report page layout (mirrors the AI review page)

```text
+--------------------------------------------------+
|  HEADER BANNER                                    |
|  Resort Name (large)          Booking # badge     |
|  Supplier  |  Destination  |  Trip Dates          |
+--------------------------------------------------+
|                                                    |
|  MAIN COLUMN (left ~60%)   |  SIDEBAR (right ~40%)|
|                            |                       |
|  -- Trip Summary Card --   |  -- Quick Facts --    |
|  Client, Room Type,        |  Travellers           |
|  Meal Plan, Transfers,     |  Room Type            |
|  Insurance, any extras     |  Supplier             |
|  presented as organized    |  Booking #            |
|  sections, not raw rows    |  Dates                |
|                            |                       |
|  -- Flight Itinerary --    |  -- Pricing --        |
|  Departure card with       |  Total (large)        |
|  airline, flight #,        |  Deposit bar          |
|  airports, times           |  Taxes                |
|  Return card same format   |  Per person           |
|                            |                       |
|  -- Events Timeline --     |  -- Documents --      |
|  Visual timeline with      |  Thumbnail grid       |
|  completion toggles        |  of uploaded files     |
|                            |                       |
|  -- Uploaded Documents --  |  -- Actions --        |
|  Full image previews       |  Re-scan button       |
|  File downloads            |  Add docs (chat)      |
|                            |  Delete booking       |
+--------------------------------------------------+
|  IN-BOOKING CHAT BAR (sticky bottom)              |
|  [paperclip] Type to add info...         [send]   |
+--------------------------------------------------+
```

### 3. Design elements borrowed from AI review page

- **Rating-bar style** for pricing breakdown (progress bars showing deposit paid vs total)
- **Photo gallery grid** for uploaded document images (same `PhotoGallery` lightbox component)
- **Section cards with icons** (same card styling as review sections)
- **Badge/tag chips** for extras (meal plan, transfers, insurance) -- same style as "Best For" tags on reviews
- **2-column responsive layout** that collapses to single column on mobile

### 4. Data flow stays the same

No database or edge function changes needed. The `booking_details` table and `booking-assistant` function already extract everything. This is a pure frontend presentation upgrade.

### 5. Navigation updates

- Clicking a booking row in the table navigates to `/booking/:bookingNumber` instead of opening a dialog
- Back button returns to the bookings tab
- Calendar booking clicks also navigate to the full page

## Technical Details

### New file: `src/pages/BookingReport.tsx`
- Full-page component with Header/Footer
- Fetches from both `bookings` (events) and `booking_details` (metadata) tables by booking number
- 2-column layout using existing Tailwind grid patterns
- Reuses existing components: `PhotoGallery`, `Badge`, `Card`, `ScrollArea`
- Includes the in-booking chat bar (same logic currently in BookingManager)
- Includes re-scan functionality
- Responsive: 2 columns on desktop, single column stacked on mobile

### Modified: `src/components/dashboard/BookingManager.tsx`
- Remove the detail dialog entirely (the large Dialog with all the cards)
- Keep the bookings table and chat input bar
- `openBookingDetail` now navigates to `/booking/:bookingNumber` using `react-router-dom`

### Modified: `src/components/dashboard/BookingCalendar.tsx`
- Calendar event clicks navigate to `/booking/:bookingNumber` instead of opening the dialog

### Modified: `src/App.tsx`
- Add route: `/booking/:bookingNumber` pointing to `BookingReport.tsx`

### Shared components extracted
- `FlightLeg`, `DetailRow` helpers moved to a shared file or kept in `BookingReport.tsx`
- `upsertBookingDetails` logic shared between BookingManager (for new bookings) and BookingReport (for re-scans/chat updates)

