

# Add Room Button with Room-Based Passenger Display

## Overview

Replace the complex multi-cabin AI logic with a simple, manual "Add Room" workflow. Passengers are organized into rooms within a single booking record. The first upload always goes to Room 1, and the agent clicks "Add Room" to create additional rooms and upload their documents.

## How It Works

### Data Model

Add a `rooms` JSONB column to `booking_details`. Each room stores its own passengers and cabin-specific info:

```text
rooms: [
  {
    room_number: 1,
    label: "Room 1",
    passengers: [{ name: "...", dob: "...", ... }],
    cabin_number: "GUAR",
    cabin_category: "Interior (IE)",
    deck: "8",
    bed_configuration: "QUEEN",
    pricing: { total: 2499, deposit: 350, ... }
  },
  {
    room_number: 2,
    label: "Room 2",
    passengers: [{ name: "...", ... }],
    cabin_number: "B304",
    cabin_category: "Balcony (BF)",
    ...
  }
]
```

### Migration from Current Data

When the page loads and `rooms` is empty but `passengers` exists, auto-migrate: move the existing passengers, cabin info, and pricing into Room 1. This is done in-memory on load and saved back to the database so existing bookings seamlessly adopt the new format.

### UI Changes on BookingReport

1. **Passengers card becomes Rooms section** -- each room gets its own card labeled "Room 1", "Room 2", etc., showing its passengers, cabin category, deck, and pricing
2. **"Add Room" button** -- appears below the last room card. Clicking it opens a dialog with:
   - File upload area (for the new room's booking confirmation screenshots)
   - A text input for additional instructions
   - A "Process" button that sends the files to the booking-assistant AI with instructions to extract only the new room's data
3. The AI response populates a new room entry in the `rooms` array
4. Each room card retains the existing edit/delete passenger buttons
5. A "Delete Room" button on each room card (except Room 1) removes that room

### Edge Function Update

No changes to the edge function schema. The frontend will handle room assignment by telling the AI "extract passengers and cabin info for this room" and then slotting the response into the correct room in the `rooms` array.

## Technical Details

### Database Migration

```sql
ALTER TABLE booking_details
  ADD COLUMN IF NOT EXISTS rooms jsonb DEFAULT '[]'::jsonb;
```

### Files Modified

- **New migration** -- adds `rooms` column
- **`src/pages/BookingReport.tsx`** -- main changes:
  - Auto-migration logic: on load, if `rooms` is empty and `passengers` has data, build Room 1 from existing top-level fields
  - Replace single Passengers card with per-room cards
  - Add "Add Room" button and dialog component
  - Room-level edit/delete passenger functions (operating on `rooms[roomIndex].passengers[passengerIndex]`)
  - "Delete Room" confirmation dialog
  - Save rooms array back to `booking_details` on any change

### Room Card Layout

```text
+--------------------------------------------------+
|  Room 1                              [Delete Room]|
|  Interior (IE) · Deck 8 · QUEEN                  |
|  ------------------------------------------------|
|  [Avatar] Pat Mastrogiacomo    [Edit] [Delete]    |
|           Adult (Male)                            |
|  [Avatar] Jane Doe             [Edit] [Delete]    |
|           Adult (Female)                          |
|  Pricing: CA$2,499.68                             |
+--------------------------------------------------+
|  Room 2                              [Delete Room]|
|  Balcony (BF) · Deck 12 · TWIN                   |
|  ------------------------------------------------|
|  [Avatar] John Smith           [Edit] [Delete]    |
|           Adult (Male)                            |
|  Pricing: CA$3,199.00                             |
+--------------------------------------------------+
|         [+ Add Room]                              |
+--------------------------------------------------+
```

### Add Room Dialog Flow

1. Agent clicks "+ Add Room"
2. Dialog opens with file upload and optional message field
3. Agent uploads the new room's confirmation screenshots
4. Clicks "Process" -- files are sent to the AI
5. AI extracts passengers, cabin info, pricing
6. A new room entry is appended to the `rooms` array
7. Dialog closes, new room card appears immediately

